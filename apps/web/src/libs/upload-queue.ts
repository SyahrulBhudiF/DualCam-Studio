import { Cause, Effect, Exit, Queue, Result, Schedule, Scope } from "effect";
import {
	cancelUpload,
	finalizeUpload,
	getChunkSize,
	initUpload,
	uploadChunk,
} from "@/apis/upload";

export type UploadJob = {
	questionId: string;
	folderName: string;
	fileName: string;
	blob: Blob;
};

export type UploadState = {
	pending: number;
	running: number;
	completed: Record<string, string>;
	failed: Record<string, string>;
};

export type UploadQueueRuntime = {
	enqueue: (job: UploadJob) => Promise<void>;
	waitForIdle: () => Promise<UploadState>;
	shutdown: () => Promise<void>;
};

export type UploadQueueOptions = {
	maxJobs: number;
	concurrency: number;
	onState: (state: UploadState) => void;
};

const RETRIES = 2;

export const initialUploadState: UploadState = {
	pending: 0,
	running: 0,
	completed: {},
	failed: {},
};

const getErrorMessage = (error: unknown) => {
	const failure = Cause.isCause(error) ? Cause.findFail(error) : undefined;
	const failureValue = failure ? Result.getSuccess(failure) : undefined;
	if (failureValue?._tag === "Some") {
		return getErrorMessage(failureValue.value.error);
	}
	return error instanceof Error ? error.message : "Upload failed";
};

const retryPolicy = <A>(effect: Effect.Effect<A, unknown, never>) =>
	effect.pipe(Effect.retry(Schedule.recurs(RETRIES)));

const uploadJob = (job: UploadJob) =>
	Effect.gen(function* () {
		const signal = yield* Effect.abortSignal;
		const session = yield* Effect.tryPromise(() =>
			initUpload(
				{
					folderName: job.folderName,
					fileName: job.fileName,
					size: job.blob.size,
					contentType: job.blob.type || "video/webm",
				},
				signal,
			),
		);

		return yield* Effect.gen(function* () {
			const chunkSize = session.chunkSize || getChunkSize();
			yield* Effect.forEach(
				Array.from({ length: session.totalChunks }, (_, index) => index),
				(index) => {
					const start = index * chunkSize;
					const chunk = job.blob.slice(start, start + chunkSize);
					return retryPolicy(
						Effect.tryPromise(() =>
							uploadChunk(
								{
									uploadId: session.uploadId,
									index,
									totalChunks: session.totalChunks,
									chunk,
								},
								signal,
							),
						),
					);
				},
				{ concurrency: 1, discard: true },
			);
			return yield* Effect.tryPromise(() =>
				finalizeUpload(session.uploadId, signal),
			);
		}).pipe(
			Effect.catch((error) =>
				Effect.gen(function* () {
					yield* Effect.tryPromise(() => cancelUpload(session.uploadId)).pipe(
						Effect.ignore,
					);
					return yield* Effect.fail(error);
				}),
			),
		);
	});

export const createUploadQueue = async ({
	maxJobs,
	concurrency,
	onState,
}: UploadQueueOptions): Promise<UploadQueueRuntime> => {
	const scope = Effect.runSync(Scope.make());
	const queue = await Effect.runPromise(Queue.bounded<UploadJob>(maxJobs));
	let state = initialUploadState;
	const waiters: Array<(state: UploadState) => void> = [];

	const setState = (update: (state: UploadState) => UploadState) =>
		Effect.sync(() => {
			state = update(state);
			onState(state);
			if (state.pending === 0 && state.running === 0) {
				const ready = waiters.splice(0);
				ready.forEach((resolve) => resolve(state));
			}
		});

	const worker = Effect.forever(
		Effect.gen(function* () {
			const job = yield* Queue.take(queue);
			yield* setState((current) => ({
				...current,
				pending: Math.max(0, current.pending - 1),
				running: current.running + 1,
			}));

			const exit = yield* Effect.exit(uploadJob(job));
			yield* setState((current) => {
				const running = Math.max(0, current.running - 1);
				if (Exit.isSuccess(exit)) {
					return {
						...current,
						running,
						completed: {
							...current.completed,
							[job.questionId]: exit.value.path,
						},
					};
				}
				return {
					...current,
					running,
					failed: {
						...current.failed,
						[job.questionId]: getErrorMessage(exit.cause),
					},
				};
			});
		}),
	);

	await Effect.runPromise(
		Effect.forEach(
			Array.from({ length: concurrency }),
			() => worker.pipe(Effect.forkScoped),
			{ discard: true },
		).pipe(Effect.provideService(Scope.Scope, scope)) as Effect.Effect<
			void,
			never,
			never
		>,
	);

	return {
		enqueue: (job) =>
			Effect.runPromise(
				Queue.offer(queue, job).pipe(
					Effect.zip(
						setState((current) => ({
							...current,
							pending: current.pending + 1,
						})),
						{ concurrent: true },
					),
				),
			).then(() => undefined),
		waitForIdle: () => {
			if (state.pending === 0 && state.running === 0)
				return Promise.resolve(state);
			return new Promise<UploadState>((resolve) => waiters.push(resolve));
		},
		shutdown: () =>
			Effect.runPromise(
				Queue.shutdown(queue).pipe(
					Effect.zip(Scope.close(scope, Exit.void), { concurrent: true }),
				),
			).then(() => undefined),
	};
};

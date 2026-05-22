import { useCallback, useEffect, useState } from "react";
import {
	createUploadQueue,
	initialUploadState,
	type UploadJob,
	type UploadQueueRuntime,
	type UploadState,
} from "@/libs/upload-queue";

type UploadQueueOptions = {
	maxJobs: number;
	concurrency?: number;
};

const DEFAULT_CONCURRENCY = 2;

export function useUploadQueue({
	maxJobs,
	concurrency = DEFAULT_CONCURRENCY,
}: UploadQueueOptions) {
	const [queue, setQueue] = useState<UploadQueueRuntime>();
	const [state, setState] = useState<UploadState>(initialUploadState);

	useEffect(() => {
		let active = true;
		let scopedQueue: UploadQueueRuntime | undefined;
		createUploadQueue({ maxJobs, concurrency, onState: setState }).then(
			(createdQueue) => {
				if (!active) {
					void createdQueue.shutdown();
					return;
				}
				scopedQueue = createdQueue;
				setQueue(createdQueue);
			},
		);

		return () => {
			active = false;
			void scopedQueue?.shutdown();
			setQueue(undefined);
		};
	}, [concurrency, maxJobs]);

	const enqueue = useCallback(
		async (job: UploadJob) => {
			if (!queue) throw new Error("Upload queue is not ready");
			await queue.enqueue(job);
		},
		[queue],
	);

	const waitForIdle = useCallback(async () => {
		if (!queue) return state;
		return queue.waitForIdle();
	}, [queue, state]);

	return {
		enqueue,
		waitForIdle,
		pending: state.pending,
		running: state.running,
		completed: state.completed,
		failed: state.failed,
		isUploading: state.pending > 0 || state.running > 0,
	};
}

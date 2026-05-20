import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { Context, Effect, Layer, Schedule } from "effect";
import { resolve } from "node:path";
import { PredictionConfig } from "../config";
import {
	PredictionRequestError,
	PredictionUnavailableError,
} from "../errors";

export type GrpcCallback<T> = (error: grpc.ServiceError | null, response: T) => void;

export interface GrpcClient {
	call<T>(method: string, body: unknown): Effect.Effect<
		T,
		PredictionRequestError | PredictionUnavailableError
	>;
}

type RawGrpcClient = Record<
	string,
	(
		request: unknown,
		metadata: grpc.Metadata,
		options: grpc.CallOptions,
		callback: GrpcCallback<unknown>,
	) => void
>;

export class GrpcClientLayer extends Context.Service<GrpcClientLayer, GrpcClient>()(
	"GrpcClientLayer",
	{
		make: Effect.gen(function* () {
			const config = yield* PredictionConfig;
			const client = makeRawClient(`${config.host}:${config.port}`);

			const call = <T>(method: string, body: unknown) =>
				callGrpc<T>(client, method, body, config.timeoutMs).pipe(
					Effect.retry(Schedule.recurs(2)),
				);

			return { call };
		}),
	},
) {}

export const GrpcClientLive = Layer.effect(GrpcClientLayer, GrpcClientLayer.make);

function makeRawClient(address: string): RawGrpcClient {
	const protoPath = resolve(process.cwd(), "../../proto/prediction/v1/prediction.proto");
	const definition = protoLoader.loadSync(protoPath, {
		defaults: true,
		enums: String,
		keepCase: false,
		longs: Number,
		oneofs: true,
	});
	const loaded = grpc.loadPackageDefinition(definition) as unknown as {
		prediction: { v1: { PredictionService: new (...args: unknown[]) => RawGrpcClient } };
	};
	return new loaded.prediction.v1.PredictionService(
		address,
		grpc.credentials.createInsecure(),
	);
}

function callGrpc<T>(
	client: RawGrpcClient,
	method: string,
	body: unknown,
	timeoutMs: number,
): Effect.Effect<T, PredictionRequestError | PredictionUnavailableError> {
	return Effect.callback<T, PredictionRequestError | PredictionUnavailableError>(
		(resume) => {
			const fn = client[method];
			if (!fn) {
				resume(
					Effect.fail(
						new PredictionRequestError({
							message: `gRPC method not found: ${method}`,
						}),
					),
				);
				return;
			}

			fn(body, new grpc.Metadata(), callOptions(timeoutMs), (error, response) => {
				if (!error) {
					resume(Effect.succeed(response as T));
					return;
				}
				if (isTransient(error.code)) {
					resume(
						Effect.fail(
							new PredictionUnavailableError({
								message: `gRPC unavailable: ${error.message}`,
								cause: error,
							}),
						),
					);
					return;
				}
				resume(
					Effect.fail(
						new PredictionRequestError({
							message: `gRPC request failed: ${error.message}`,
							cause: error,
						}),
					),
				);
			});
		},
	);
}

function callOptions(timeoutMs: number): grpc.CallOptions {
	return { deadline: new Date(Date.now() + timeoutMs) };
}

function isTransient(code: grpc.status): boolean {
	return [
		grpc.status.DEADLINE_EXCEEDED,
		grpc.status.INTERNAL,
		grpc.status.RESOURCE_EXHAUSTED,
		grpc.status.UNAVAILABLE,
	].includes(code);
}

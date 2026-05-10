import { type Effect, Layer, ManagedRuntime } from "effect";
import { DatabaseLive } from "../layers/database";
import { AllServicesLive } from "../services";

const AppLayer = AllServicesLive.pipe(Layer.provide(DatabaseLive));

const AppRuntime = ManagedRuntime.make(
	AppLayer as Layer.Layer<unknown, never, never>,
);

export const runEffect = <A, E, R>(
	effect: Effect.Effect<A, E, R>,
): Promise<A> => AppRuntime.runPromise(effect as Effect.Effect<A, E, never>);

export const runEffectExit = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
	AppRuntime.runPromiseExit(effect as Effect.Effect<A, E, never>);

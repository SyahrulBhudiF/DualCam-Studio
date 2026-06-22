import { useMachine } from "@xstate/react";
import { assign, setup } from "xstate";
import type { ClipEvent, Signal } from "../types";

export type Phase = "wait" | "ready" | "play" | "pause" | "done" | "view" | "fail";
export type Step = "hide" | "onset" | "apex" | "offset";

const replayMachine = setup({
	types: {
		context: {} as { duration: number | null; maxTime: number; run: number },
		events: {} as
			| { type: "ready" }
			| { type: "fail" }
			| { type: "start" }
			| { type: "play" }
			| { type: "pause" }
			| { type: "time"; value: number }
			| { type: "duration"; value: number }
			| { type: "done" }
			| { type: "view" }
			| { type: "reset" },
	},
}).createMachine({
	context: { duration: null, maxTime: 0, run: 0 },
	initial: "wait",
	states: {
		wait: {
			on: {
				fail: "fail",
				ready: "ready",
			},
		},
		ready: {
			on: {
				fail: "fail",
				start: {
					actions: assign({
						maxTime: 0,
						run: ({ context }) => context.run + 1,
					}),
					target: "play",
				},
			},
		},
		play: {
			on: {
				done: "done",
				duration: { actions: assign({ duration: ({ event }) => event.value }) },
				fail: "fail",
				pause: "pause",
				time: { actions: assign({ maxTime: bumpTime }) },
			},
		},
		pause: {
			on: {
				done: "done",
				duration: { actions: assign({ duration: ({ event }) => event.value }) },
				fail: "fail",
				play: "play",
				reset: { actions: assign({ maxTime: 0, run: ({ context }) => context.run + 1 }), target: "ready" },
				time: { actions: assign({ maxTime: bumpTime }) },
			},
		},
		done: {
			on: {
				reset: { actions: assign({ maxTime: 0, run: ({ context }) => context.run + 1 }), target: "ready" },
				start: {
					actions: assign({
						maxTime: 0,
						run: ({ context }) => context.run + 1,
					}),
					target: "play",
				},
				view: "view",
			},
		},
		view: {
			on: {
				reset: { actions: assign({ maxTime: 0, run: ({ context }) => context.run + 1 }), target: "ready" },
				start: {
					actions: assign({
						maxTime: 0,
						run: ({ context }) => context.run + 1,
					}),
					target: "play",
				},
			},
		},
		fail: {},
	},
});

function bumpTime({ context, event }: { context: { maxTime: number }; event: { type: string; value?: number } }) {
	return typeof event.value === "number"
		? Math.max(context.maxTime, event.value)
		: context.maxTime;
}

export function useReplay() {
	const [snapshot, send] = useMachine(replayMachine);
	const phase = snapshot.value as Phase;
	return {
		duration: snapshot.context.duration,
		isLive: phase === "play" || phase === "pause",
		maxTime: snapshot.context.maxTime,
		phase,
		run: snapshot.context.run,
		send,
		showFinal: phase === "done" || phase === "view",
	};
}

export function eventStep(event: ClipEvent, maxTime: number): Step {
	if (
		typeof event.onsetTimeSeconds !== "number" ||
		maxTime < event.onsetTimeSeconds
	) {
		return "hide";
	}
	if (
		typeof event.apexTimeSeconds === "number" &&
		maxTime >= event.apexTimeSeconds
	) {
		return typeof event.offsetTimeSeconds === "number" &&
			maxTime >= event.offsetTimeSeconds
			? "offset"
			: "apex";
	}
	return "onset";
}

export function cutSignal(
	signal: Signal | null | undefined,
	maxTime: number,
	showFull: boolean,
): Signal | null | undefined {
	if (!signal || showFull) return signal;
	return {
		...signal,
		points: signal.points.filter((point) => point.timeSeconds <= maxTime),
	};
}

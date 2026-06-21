import { useMachine } from "@xstate/react";
import { useCallback, useRef } from "react";
import { assign, setup } from "xstate";
import type { ClipEvent } from "../types";

const EVENT_TIME_TOLERANCE_SECONDS = 0.06;
const MAX_CROSSING_DELTA_SECONDS = 0.35;

const viewerMachine = setup({
	types: {
		context: {} as { currentTime: number; selectedEventNo: number | null },
		events: {} as
			| { type: "video.time"; timeSeconds: number; eventNo: number | null }
			| { type: "event.select"; eventNo: number; timeSeconds: number },
	},
}).createMachine({
	context: { currentTime: 0, selectedEventNo: null },
	initial: "ready",
	states: {
		ready: {
			on: {
				"event.select": {
					actions: assign({
						currentTime: ({ event }) => event.timeSeconds,
						selectedEventNo: ({ event }) => event.eventNo,
					}),
				},
				"video.time": {
					actions: assign({
						currentTime: ({ event }) => event.timeSeconds,
						selectedEventNo: ({ event }) => event.eventNo,
					}),
				},
			},
		},
	},
});

export function useViewerState(events: ReadonlyArray<ClipEvent>) {
	const [snapshot, send] = useMachine(viewerMachine);
	const { currentTime, selectedEventNo } = snapshot.context;
	const previousTimeRef = useRef(0);

	const eventAtTime = useCallback(
		(timeSeconds: number, previousTimeSeconds: number) => {
			const direct = events.find(
				(event) =>
					(event.onsetTimeSeconds ?? -1) - EVENT_TIME_TOLERANCE_SECONDS <=
						timeSeconds &&
					timeSeconds <=
						(event.offsetTimeSeconds ?? -1) + EVENT_TIME_TOLERANCE_SECONDS,
			);
			if (direct) return direct;

			const delta = Math.abs(timeSeconds - previousTimeSeconds);
			if (delta > MAX_CROSSING_DELTA_SECONDS) return null;

			const start = Math.min(previousTimeSeconds, timeSeconds);
			const end = Math.max(previousTimeSeconds, timeSeconds);
			return (
				events.find(
					(event) =>
						typeof event.onsetTimeSeconds === "number" &&
						typeof event.offsetTimeSeconds === "number" &&
						event.onsetTimeSeconds <= end + EVENT_TIME_TOLERANCE_SECONDS &&
						start - EVENT_TIME_TOLERANCE_SECONDS <= event.offsetTimeSeconds,
				) ?? null
			);
		},
		[events],
	);

	const syncVideoTime = useCallback(
		(timeSeconds: number) => {
			const previousTime = previousTimeRef.current;
			previousTimeRef.current = timeSeconds;
			send({
				eventNo: eventAtTime(timeSeconds, previousTime)?.eventNo ?? null,
				timeSeconds,
				type: "video.time",
			});
		},
		[eventAtTime, send],
	);

	const selectEvent = useCallback(
		(event: ClipEvent) => {
			const target =
				typeof event.apexTimeSeconds === "number"
					? event.apexTimeSeconds
					: event.onsetTimeSeconds;
			if (typeof target !== "number") return null;
			send({ eventNo: event.eventNo, timeSeconds: target, type: "event.select" });
			return target;
		},
		[send],
	);

	return {
		currentTime,
		selectedEventNo,
		selectEvent,
		syncVideoTime,
	};
}

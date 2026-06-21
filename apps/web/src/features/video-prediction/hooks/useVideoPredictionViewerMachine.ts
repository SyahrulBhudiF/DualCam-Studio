import { useMachine } from "@xstate/react";
import { useCallback } from "react";
import { assign, setup } from "xstate";

export type VideoPredictionTimelineEvent = {
	eventNo: number;
	onsetTimeSeconds: number | null;
	apexTimeSeconds: number | null;
	offsetTimeSeconds: number | null;
};

const DISPLAY_TIME_STEP_SECONDS = 0.1;

function quantizeTime(timeSeconds: number) {
	return Math.round(timeSeconds / DISPLAY_TIME_STEP_SECONDS) * DISPLAY_TIME_STEP_SECONDS;
}

const videoPredictionViewerMachine = setup({
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
						currentTime: ({ event }) => quantizeTime(event.timeSeconds),
						selectedEventNo: ({ event }) => event.eventNo,
					}),
				},
				"video.time": {
					actions: assign({
						currentTime: ({ event }) => quantizeTime(event.timeSeconds),
						selectedEventNo: ({ event }) => event.eventNo,
					}),
				},
			},
		},
	},
});

export function useVideoPredictionViewerMachine(
	events: ReadonlyArray<VideoPredictionTimelineEvent>,
) {
	const [snapshot, send] = useMachine(videoPredictionViewerMachine);
	const { currentTime, selectedEventNo } = snapshot.context;

	const eventAtTime = useCallback(
		(timeSeconds: number) =>
			events.find(
				(event) =>
					(event.onsetTimeSeconds ?? -1) <= timeSeconds &&
					timeSeconds <= (event.offsetTimeSeconds ?? -1),
			) ?? null,
		[events],
	);

	const syncVideoTime = useCallback(
		(timeSeconds: number) => {
			send({
				eventNo: eventAtTime(timeSeconds)?.eventNo ?? null,
				timeSeconds,
				type: "video.time",
			});
		},
		[eventAtTime, send],
	);

	const selectEvent = useCallback(
		(event: VideoPredictionTimelineEvent) => {
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

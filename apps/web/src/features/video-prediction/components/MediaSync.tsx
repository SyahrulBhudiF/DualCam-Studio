import { useMediaState } from "@vidstack/react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { ClipEvent, MediaTimeStore, Signal } from "../types";
import { SpotChart } from "./SpotChart";

export function createMediaTimeStore(): MediaTimeStore {
	let currentTime = 0;
	const listeners = new Set<() => void>();
	return {
		getSnapshot: () => currentTime,
		setCurrentTime: (nextTime: number) => {
			if (Object.is(currentTime, nextTime)) return;
			currentTime = nextTime;
			listeners.forEach((listener) => listener());
		},
		subscribe: (listener: () => void) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
}

const EVENT_TIME_TOLERANCE_SECONDS = 0.06;

function activeEventNo(events: ReadonlyArray<ClipEvent>, timeSeconds: number) {
	return (
		events.find(
			(event) =>
				(event.onsetTimeSeconds ?? -1) - EVENT_TIME_TOLERANCE_SECONDS <=
					timeSeconds &&
				timeSeconds <=
					(event.offsetTimeSeconds ?? -1) + EVENT_TIME_TOLERANCE_SECONDS,
		)?.eventNo ?? null
	);
}

export function VidstackSync({
	events,
	onEventTimeChange,
	timeStore,
}: {
	events: ClipEvent[];
	onEventTimeChange: (timeSeconds: number) => void;
	timeStore: MediaTimeStore;
}) {
	const currentTime = useMediaState("currentTime");
	const lastEventNoRef = useRef<number | null>(null);

	useEffect(() => {
		timeStore.setCurrentTime(currentTime);
	}, [currentTime, timeStore]);

	useEffect(() => {
		const eventNo = activeEventNo(events, currentTime);
		if (lastEventNoRef.current === eventNo) return;
		lastEventNoRef.current = eventNo;
		onEventTimeChange(currentTime);
	}, [currentTime, events, onEventTimeChange]);

	return null;
}

export function SpotChartWithTime({
	activeEventNo,
	events,
	onSelectEvent,
	signal,
	timeStore,
}: {
	activeEventNo: number | null;
	events: ClipEvent[];
	onSelectEvent: (event: ClipEvent) => void;
	signal: Signal | null | undefined;
	timeStore: MediaTimeStore;
}) {
	const currentTime = useSyncExternalStore(
		timeStore.subscribe,
		timeStore.getSnapshot,
		timeStore.getSnapshot,
	);

	return (
		<SpotChart
			activeEventNo={activeEventNo}
			currentTime={currentTime}
			events={events}
			onSelectEvent={onSelectEvent}
			signal={signal}
		/>
	);
}

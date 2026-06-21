import { describe, expect, it, vi } from "vitest";
import {
	clearSeekPause,
	markSeekPause,
	stopSeekAutoplay,
} from "@/features/video-prediction/hooks/playbackGuard";
import type { Player } from "@/features/video-prediction/types";

describe("video prediction event seek playback guard", () => {
	it("pauses autoplay emitted after an event seek", () => {
		const seekPauseRef = { current: false };
		const pause = vi.fn();
		const player: Player = {
			currentTime: 7.25,
			duration: 7.4,
			pause,
		};

		markSeekPause(seekPauseRef);
		const blocked = stopSeekAutoplay(
			seekPauseRef,
			player,
		);

		expect(blocked).toBe(true);
		expect(pause).toHaveBeenCalledTimes(1);
	});

	it("does not block normal user playback after pointer intent clears the guard", () => {
		const seekPauseRef = { current: false };
		const pause = vi.fn();
		const player: Player = {
			currentTime: 7.25,
			duration: 7.4,
			pause,
		};

		markSeekPause(seekPauseRef);
		clearSeekPause(seekPauseRef);
		const blocked = stopSeekAutoplay(
			seekPauseRef,
			player,
		);

		expect(blocked).toBe(false);
		expect(pause).not.toHaveBeenCalled();
	});
});

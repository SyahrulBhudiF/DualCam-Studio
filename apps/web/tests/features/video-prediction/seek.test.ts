import { describe, expect, it, vi } from "vitest";
import {
	seekTarget,
	safeSeekTarget,
	seekPaused,
} from "@/features/video-prediction/hooks/seek";
import type { Player } from "@/features/video-prediction/types";

describe("video prediction event seek", () => {
	it("uses onset instead of apex for near-end events", () => {
		expect(
			seekTarget({ apexTimeSeconds: 7.05, onsetTimeSeconds: 6.95 }, 7.4),
		).toBeCloseTo(6.95);
		expect(
			seekTarget({ apexTimeSeconds: 2.35, onsetTimeSeconds: 2.3 }, 7.4),
		).toBeCloseTo(2.35);
	});

	it("clamps raw seek targets near video end", () => {
		expect(safeSeekTarget(7.3, 7.4)).toBeCloseTo(7.25);
		expect(safeSeekTarget(2.35, 7.4)).toBeCloseTo(2.35);
	});

	it("seeks to the safe target and keeps the player paused", () => {
		vi.useFakeTimers();
		const pause = vi.fn();
		const seekedListeners: Array<() => void> = [];
		const player: Player = {
			currentTime: 0,
			duration: 7.4,
			paused: false,
			pause,
			addEventListener: vi.fn((_type, listener) => {
				seekedListeners.push(listener);
			}),
		};
		const animationFrames: FrameRequestCallback[] = [];
		const previousRequestAnimationFrame = globalThis.requestAnimationFrame;
		globalThis.requestAnimationFrame = vi.fn(
			(callback: FrameRequestCallback) => {
				animationFrames.push(callback);
				return animationFrames.length;
			},
		);

		const target = seekPaused(player, 7.3);

		expect(target).toBeCloseTo(7.25);
		expect(player.currentTime).toBeCloseTo(7.25);
		expect(player.paused).toBe(true);
		expect(pause).toHaveBeenCalledTimes(2);

		animationFrames.forEach((callback) => callback(0));
		expect(pause).toHaveBeenCalledTimes(3);

		expect(seekedListeners).toHaveLength(1);
		seekedListeners[0]?.();
		expect(pause).toHaveBeenCalledTimes(4);

		vi.advanceTimersByTime(100);
		expect(pause).toHaveBeenCalledTimes(5);

		globalThis.requestAnimationFrame = previousRequestAnimationFrame;
		vi.useRealTimers();
	});
});

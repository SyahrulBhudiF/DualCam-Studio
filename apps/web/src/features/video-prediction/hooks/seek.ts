import type { Player, SeekEvent } from "../types";

const NEAR_END_EVENT_MARGIN_SECONDS = 0.5;

export function seekTarget(event: SeekEvent, duration: number) {
	const apex = event.apexTimeSeconds;
	const onset = event.onsetTimeSeconds;
	if (typeof apex !== "number") return onset;
	if (
		typeof onset === "number" &&
		Number.isFinite(duration) &&
		duration > 0 &&
		duration - apex <= NEAR_END_EVENT_MARGIN_SECONDS
	) {
		return onset;
	}
	return apex;
}

export function safeSeekTarget(target: number, duration: number) {
	return Number.isFinite(duration) && duration > 0
		? Math.min(target, Math.max(duration - 0.15, 0))
		: target;
}

function forcePause(player: Player) {
	if ("paused" in player) player.paused = true;
	void player.pause();
}

export function seekPaused(player: Player, target: number) {
	const safeTarget = safeSeekTarget(target, player.duration);
	player.addEventListener?.("seeked", () => forcePause(player), { once: true });
	forcePause(player);
	player.currentTime = safeTarget;
	forcePause(player);
	requestAnimationFrame(() => forcePause(player));
	setTimeout(() => forcePause(player), 100);
	return safeTarget;
}

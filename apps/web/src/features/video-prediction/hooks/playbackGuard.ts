import type { BoolRef, Player } from "../types";

export function markSeekPause(seekPauseRef: BoolRef) {
	seekPauseRef.current = true;
}

export function clearSeekPause(seekPauseRef: BoolRef) {
	seekPauseRef.current = false;
}

export function stopSeekAutoplay(
	seekPauseRef: BoolRef,
	player: Player | null,
) {
	if (!seekPauseRef.current || !player) return false;
	void player.pause();
	return true;
}

import { afterEach, describe, expect, it, vi } from "vitest";
import {
	getMainCameraStream,
	resetCameraSetupForTest,
} from "@/libs/hooks/use-camera-setup";

const setMediaDevices = (mediaDevices: Partial<MediaDevices>) => {
	Object.defineProperty(globalThis.navigator, "mediaDevices", {
		configurable: true,
		value: mediaDevices,
	});
};

const createStream = (active = true) =>
	({
		active,
		getTracks: () => [],
	}) as unknown as MediaStream;

afterEach(() => {
	resetCameraSetupForTest();
	vi.restoreAllMocks();
});

describe("getMainCameraStream", () => {
	it("opens default webcam without audio", async () => {
		const stream = createStream();
		const getUserMedia = vi.fn().mockResolvedValue(stream);
		setMediaDevices({ getUserMedia } as Partial<MediaDevices>);

		await expect(getMainCameraStream("")).resolves.toBe(stream);

		expect(getUserMedia).toHaveBeenCalledTimes(1);
		expect(getUserMedia).toHaveBeenCalledWith({
			video: true,
			audio: false,
		});
	});

	it("uses ideal device id when selected", async () => {
		const stream = createStream();
		const getUserMedia = vi.fn().mockResolvedValue(stream);
		setMediaDevices({ getUserMedia } as Partial<MediaDevices>);

		await getMainCameraStream("camera-1");

		expect(getUserMedia).toHaveBeenCalledWith({
			video: { deviceId: { ideal: "camera-1" } },
			audio: false,
		});
	});

	it("deduplicates concurrent camera opens", async () => {
		const stream = createStream();
		let resolveStream!: (stream: MediaStream) => void;
		const getUserMedia = vi.fn(
			() => new Promise<MediaStream>((resolve) => (resolveStream = resolve)),
		);
		setMediaDevices({ getUserMedia } as Partial<MediaDevices>);

		const first = getMainCameraStream("");
		const second = getMainCameraStream("");
		resolveStream(stream);

		await expect(Promise.all([first, second])).resolves.toEqual([stream, stream]);
		expect(getUserMedia).toHaveBeenCalledTimes(1);
	});

	it("reuses active opened stream", async () => {
		const stream = createStream(true);
		const getUserMedia = vi.fn().mockResolvedValue(stream);
		setMediaDevices({ getUserMedia } as Partial<MediaDevices>);

		await getMainCameraStream("");
		await expect(getMainCameraStream("")).resolves.toBe(stream);

		expect(getUserMedia).toHaveBeenCalledTimes(1);
	});

	it("reopens when cached stream is inactive", async () => {
		const inactiveStream = createStream(false);
		const activeStream = createStream(true);
		const getUserMedia = vi
			.fn()
			.mockResolvedValueOnce(inactiveStream)
			.mockResolvedValueOnce(activeStream);
		setMediaDevices({ getUserMedia } as Partial<MediaDevices>);

		await getMainCameraStream("");
		await expect(getMainCameraStream("")).resolves.toBe(activeStream);

		expect(getUserMedia).toHaveBeenCalledTimes(2);
	});
});

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import type { RealSenseHandle } from "@/components/RealSenseCanvas";

type RecordingStartResult = {
	secondaryPath: string | null;
};

type RecordingStopResult = {
	blobMain: Blob;
	blobSec: Blob | null;
	secondaryPath: string | null;
};

const stopRecorderSafe = (recorder: MediaRecorder | null): Promise<void> => {
	return new Promise((resolve) => {
		if (!recorder || recorder.state === "inactive") {
			resolve();
			return;
		}
		recorder.onstop = () => resolve();
		recorder.stop();
	});
};

export interface RecordingOptions {
	folderName: string;
	mode: "FULL" | "SEGMENT";
	fileName?: string;
}

let videoDevicesSnapshot: MediaDeviceInfo[] | undefined;
let sharedMainStream: MediaStream | null = null;
let sharedMainStreamPromise: Promise<MediaStream> | null = null;
const videoDevicesListeners = new Set<() => void>();

export const resetCameraSetupForTest = () => {
	videoDevicesSnapshot = undefined;
	sharedMainStream = null;
	sharedMainStreamPromise = null;
};

export const getMainCameraStream = (deviceId: string) => {
	const existingStream = sharedMainStream?.active ? sharedMainStream : null;
	if (existingStream) return Promise.resolve(existingStream);

	sharedMainStreamPromise ??= navigator.mediaDevices
		.getUserMedia({
			video: deviceId ? { deviceId: { ideal: deviceId } } : true,
			audio: false,
		})
		.then((stream) => {
			sharedMainStream = stream;
			return stream;
		})
		.finally(() => {
			sharedMainStreamPromise = null;
		});

	return sharedMainStreamPromise;
};

const getVideoDevicesSnapshot = () => videoDevicesSnapshot;
const getVideoDevicesServerSnapshot = () => undefined;
const subscribeVideoDevices = (listener: () => void) => {
	videoDevicesListeners.add(listener);
	return () => videoDevicesListeners.delete(listener);
};
const loadVideoDevices = async () => {
	const devices = await navigator.mediaDevices.enumerateDevices();
	const cameras = devices.filter((d) => d.kind === "videoinput");
	videoDevicesSnapshot = cameras;
	videoDevicesListeners.forEach((listener) => listener());
	return cameras;
};

export function useCameraSetup() {
	const videoDevices = useSyncExternalStore(
		subscribeVideoDevices,
		getVideoDevicesSnapshot,
		getVideoDevicesServerSnapshot,
	);
	const [isRecording, setIsRecording] = useState(false);
	const [mainReady, setMainReady] = useState(false);
	const [secReady, setSecReady] = useState(false);
	const [deviceIdMain, setDeviceIdMain] = useState<string>();
	const [deviceIdSec, setDeviceIdSec] = useState("ws-realsense");

	const selectedDeviceIdMain = deviceIdMain ?? "";

	const isStartingRef = useRef(false);

	const videoElementMainRef = useRef<HTMLVideoElement | null>(null);
	const videoElementSecRef = useRef<HTMLVideoElement | null>(null);
	const videoRefMain = useCallback((element: HTMLVideoElement | null) => {
		videoElementMainRef.current = element;
		if (element) element.srcObject = mainStreamRef.current;
	}, []);
	const videoRefSec = useCallback((element: HTMLVideoElement | null) => {
		videoElementSecRef.current = element;
		if (element) element.srcObject = secStreamRef.current;
	}, []);
	const realSenseRef = useRef<RealSenseHandle | null>(null);

	const mainStreamRef = useRef<MediaStream | null>(null);
	const secStreamRef = useRef<MediaStream | null>(null);
	const mainRecorderRef = useRef<MediaRecorder | null>(null);
	const secRecorderRef = useRef<MediaRecorder | null>(null);
	const mainChunksRef = useRef<Blob[]>([]);
	const secChunksRef = useRef<Blob[]>([]);
	const secondaryPathRef = useRef<string | null>(null);

	// Enumerate devices once
	useEffect(() => {
		const getDevices = async () => {
			try {
				await loadVideoDevices();
			} catch (err) {
				console.error(err);
			}
		};
		getDevices();
	}, []);

	// Main camera setup
	useEffect(() => {
		let cancelled = false;
		const streams = new Set<MediaStream>();

		const startMain = async () => {
			try {
				mainRecorderRef.current = null;
				setMainReady(false);

				const stream = await getMainCameraStream(selectedDeviceIdMain);

				streams.add(stream);
				if (cancelled) return;

				mainStreamRef.current = stream;
				if (videoElementMainRef.current) {
					videoElementMainRef.current.srcObject = stream;
				}

				const devices = await navigator.mediaDevices.enumerateDevices();
				videoDevicesSnapshot = devices.filter((d) => d.kind === "videoinput");
				videoDevicesListeners.forEach((listener) => listener());

				const mediaRecorder = new MediaRecorder(stream);
				mainChunksRef.current = [];
				mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) mainChunksRef.current.push(event.data);
				};
				mainRecorderRef.current = mediaRecorder;
				setMainReady(true);
			} catch (err) {
				console.error("Main camera failed", err);
			}
		};
		void startMain();

		return () => {
			cancelled = true;
			if (videoElementMainRef.current) videoElementMainRef.current.srcObject = null;
			setMainReady(false);
		};
	}, [selectedDeviceIdMain]);

	// Secondary camera setup
	useEffect(() => {
		if (deviceIdSec === "ws-realsense") {
			// RealSense readiness is set externally via setSecReady
			return;
		}
		if (!deviceIdSec) return;
		let cancelled = false;
		const streams = new Set<MediaStream>();

		const startSec = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: {
						deviceId: { exact: deviceIdSec },
						width: { ideal: 640 },
						height: { ideal: 480 },
					},
					audio: false,
				});

				streams.add(stream);
				if (cancelled) {
					stream.getTracks().forEach((t) => t.stop());
					return;
				}

				secStreamRef.current = stream;
				if (videoElementSecRef.current) {
					videoElementSecRef.current.srcObject = stream;
				}

				const mediaRecorder = new MediaRecorder(stream, {
					mimeType: "video/webm",
				});
				secChunksRef.current = [];
				mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) secChunksRef.current.push(event.data);
				};
				secRecorderRef.current = mediaRecorder;
				setSecReady(true);
			} catch (err) {
				console.error(err);
			}
		};
		startSec();

		return () => {
			cancelled = true;
			streams.forEach((stream) => {
				stream.getTracks().forEach((track) => track.stop());
			});
			setSecReady(false);
		};
	}, [deviceIdSec]);

	const startRecording = useCallback(
		async (options: RecordingOptions): Promise<RecordingStartResult | null> => {
			if (isStartingRef.current) return null;
			isStartingRef.current = true;
			secondaryPathRef.current = null;

			if (
				mainRecorderRef.current &&
				mainRecorderRef.current.state === "inactive"
			) {
				mainChunksRef.current = [];
				mainRecorderRef.current.start(1000);
			}

			let secondaryPath: string | null = null;
			if (deviceIdSec === "ws-realsense" && secReady) {
				secondaryPath =
					(await realSenseRef.current?.startRecording(options)) ?? null;
			} else if (
				secRecorderRef.current &&
				secRecorderRef.current.state === "inactive"
			) {
				secChunksRef.current = [];
				secRecorderRef.current.start(1000);
			}
			secondaryPathRef.current = secondaryPath;

			setIsRecording(true);

			setTimeout(() => {
				isStartingRef.current = false;
			}, 500);

			return { secondaryPath };
		},
		[deviceIdSec, secReady],
	);

	const stopRecording = useCallback(async (): Promise<RecordingStopResult> => {
		const stopMain = stopRecorderSafe(mainRecorderRef.current);
		const stopSecondary =
			deviceIdSec === "ws-realsense"
				? (realSenseRef.current?.stopRecording() ?? Promise.resolve(null))
				: stopRecorderSafe(secRecorderRef.current).then(() => null);

		const [, stoppedSecondaryPath] = await Promise.all([
			stopMain,
			stopSecondary,
		]);
		const secondaryPath = stoppedSecondaryPath ?? secondaryPathRef.current;

		setIsRecording(false);
		isStartingRef.current = false;
		secondaryPathRef.current = null;

		return {
			blobMain: new Blob(mainChunksRef.current, { type: "video/webm" }),
			blobSec:
				deviceIdSec !== "ws-realsense"
					? new Blob(secChunksRef.current, { type: "video/webm" })
					: null,
			secondaryPath,
		};
	}, [deviceIdSec]);

	const allReady = mainReady;

	return {
		videoDevices: videoDevices ?? [],
		isRecording,
		allReady,
		startRecording,
		stopRecording,

		deviceIdMain: selectedDeviceIdMain,
		setDeviceIdMain,
		videoRefMain,
		streamMain: mainStreamRef.current,

		deviceIdSec,
		setDeviceIdSec,
		videoRefSec,
		streamSec: secStreamRef.current,
		secReady,
		setSecReady,

		realSenseRef,
	};
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealSenseHandle } from "@/components/RealSenseCanvas";

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

function useCameraUnit(defaultDeviceId = "") {
	const [deviceId, setDeviceId] = useState(defaultDeviceId);
	const [isReady, setReady] = useState(false);
	const [stream, setStream] = useState<MediaStream | null>(null);

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const recorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);

	// Auto-attach stream to video element
	useEffect(() => {
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
		}
	}, [stream]);

	return {
		deviceId,
		setDeviceId,
		isReady,
		setReady,
		stream,
		setStream,
		videoRef,
		recorderRef,
		chunksRef,
	};
}

export function useCameraSetup() {
	const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
	const [isRecording, setIsRecording] = useState(false);

	const isStartingRef = useRef(false);

	const main = useCameraUnit("");
	const sec = useCameraUnit("ws-realsense");
	const realSenseRef = useRef<RealSenseHandle | null>(null);

	useEffect(() => {
		const getDevices = async () => {
			try {
				await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
				const devices = await navigator.mediaDevices.enumerateDevices();
				const cameras = devices.filter((d) => d.kind === "videoinput");
				setVideoDevices(cameras);
				if (cameras.length > 0) main.setDeviceId(cameras[0].deviceId);
			} catch (err) {
				console.error(err);
			}
		};
		getDevices();
	}, []);

	useEffect(() => {
		if (!main.deviceId) return;
		const startMain = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: {
						deviceId: { exact: main.deviceId },
						width: { ideal: 640 },
						height: { ideal: 480 },
					},
					audio: true,
				});
				main.setStream(stream);
				const mediaRecorder = new MediaRecorder(stream);
				main.chunksRef.current = [];
				mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) main.chunksRef.current.push(event.data);
				};
				main.recorderRef.current = mediaRecorder;
				main.setReady(true);
			} catch (err) {
				console.error(err);
			}
		};
		startMain();
		return () => main.stream?.getTracks().forEach((t) => t.stop());
	}, [main.deviceId]);

	useEffect(() => {
		if (sec.deviceId === "ws-realsense") {
			sec.setReady(true);
			return;
		}
		if (!sec.deviceId) return;
		const startSec = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: {
						deviceId: { exact: sec.deviceId },
						width: { ideal: 640 },
						height: { ideal: 480 },
					},
					audio: false,
				});
				sec.setStream(stream);
				const mediaRecorder = new MediaRecorder(stream, {
					mimeType: "video/webm",
				});
				sec.chunksRef.current = [];
				mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) sec.chunksRef.current.push(event.data);
				};
				sec.recorderRef.current = mediaRecorder;
				sec.setReady(true);
			} catch (err) {
				console.error(err);
			}
		};
		startSec();
		return () => sec.stream?.getTracks().forEach((t) => t.stop());
	}, [sec.deviceId]);

	const startRecording = useCallback(
		(options: RecordingOptions) => {
			// Prevent double start if state hasn't updated but button is pressed again
			if (isStartingRef.current) return;
			isStartingRef.current = true;

			if (
				main.recorderRef.current &&
				main.recorderRef.current.state === "inactive"
			) {
				main.chunksRef.current = [];
				main.recorderRef.current.start(1000);
			}

			if (sec.deviceId === "ws-realsense") {
				realSenseRef.current?.startRecording(options);
			} else if (
				sec.recorderRef.current &&
				sec.recorderRef.current.state === "inactive"
			) {
				sec.chunksRef.current = [];
				sec.recorderRef.current.start(1000);
			}

			setIsRecording(true);

			setTimeout(() => {
				isStartingRef.current = false;
			}, 500);
		},
		[sec.deviceId],
	);

	const stopRecording = useCallback(async () => {
		await stopRecorderSafe(main.recorderRef.current);

		if (sec.deviceId === "ws-realsense") {
			realSenseRef.current?.stopRecording();
		} else {
			await stopRecorderSafe(sec.recorderRef.current);
		}

		setIsRecording(false);
		isStartingRef.current = false;

		return {
			blobMain: new Blob(main.chunksRef.current, { type: "video/webm" }),
			blobSec:
				sec.deviceId !== "ws-realsense"
					? new Blob(sec.chunksRef.current, { type: "video/webm" })
					: null,
		};
	}, [sec.deviceId]);

	const allReady =
		main.isReady &&
		(sec.deviceId === "ws-realsense" ? sec.isReady : sec.isReady);

	return {
		videoDevices,
		isRecording,
		allReady,
		startRecording,
		stopRecording,

		deviceIdMain: main.deviceId,
		setDeviceIdMain: main.setDeviceId,
		videoRefMain: main.videoRef,
		streamMain: main.stream,

		deviceIdSec: sec.deviceId,
		setDeviceIdSec: sec.setDeviceId,
		videoRefSec: sec.videoRef,
		streamSec: sec.stream,
		secReady: sec.isReady,
		setSecReady: sec.setReady,

		realSenseRef,
	};
}

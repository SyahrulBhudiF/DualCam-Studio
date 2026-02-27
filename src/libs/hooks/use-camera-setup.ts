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

export function useCameraSetup() {
	const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
	const [isRecording, setIsRecording] = useState(false);
	const [mainReady, setMainReady] = useState(false);
	const [secReady, setSecReady] = useState(false);
	const [deviceIdMain, setDeviceIdMain] = useState("");
	const [deviceIdSec, setDeviceIdSec] = useState("ws-realsense");

	const isStartingRef = useRef(false);

	const videoRefMain = useRef<HTMLVideoElement | null>(null);
	const videoRefSec = useRef<HTMLVideoElement | null>(null);
	const realSenseRef = useRef<RealSenseHandle | null>(null);

	const mainStreamRef = useRef<MediaStream | null>(null);
	const secStreamRef = useRef<MediaStream | null>(null);
	const mainRecorderRef = useRef<MediaRecorder | null>(null);
	const secRecorderRef = useRef<MediaRecorder | null>(null);
	const mainChunksRef = useRef<Blob[]>([]);
	const secChunksRef = useRef<Blob[]>([]);

	// Enumerate devices once
	useEffect(() => {
		const getDevices = async () => {
			try {
				await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
				const devices = await navigator.mediaDevices.enumerateDevices();
				const cameras = devices.filter((d) => d.kind === "videoinput");
				setVideoDevices(cameras);
				if (cameras.length > 0) setDeviceIdMain(cameras[0].deviceId);
			} catch (err) {
				console.error(err);
			}
		};
		getDevices();
	}, []);

	// Main camera setup
	useEffect(() => {
		if (!deviceIdMain) return;
		let cancelled = false;

		const startMain = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: {
						deviceId: { exact: deviceIdMain },
						width: { ideal: 640 },
						height: { ideal: 480 },
					},
					audio: true,
				});

				if (cancelled) {
					stream.getTracks().forEach((t) => t.stop());
					return;
				}

				mainStreamRef.current = stream;
				if (videoRefMain.current) {
					videoRefMain.current.srcObject = stream;
				}

				const mediaRecorder = new MediaRecorder(stream);
				mainChunksRef.current = [];
				mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) mainChunksRef.current.push(event.data);
				};
				mainRecorderRef.current = mediaRecorder;
				setMainReady(true);
			} catch (err) {
				console.error(err);
			}
		};
		startMain();

		return () => {
			cancelled = true;
			mainStreamRef.current?.getTracks().forEach((t) => t.stop());
			mainStreamRef.current = null;
			mainRecorderRef.current = null;
			setMainReady(false);
		};
	}, [deviceIdMain]);

	// Secondary camera setup
	useEffect(() => {
		if (deviceIdSec === "ws-realsense") {
			// RealSense readiness is set externally via setSecReady
			return;
		}
		if (!deviceIdSec) return;
		let cancelled = false;

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

				if (cancelled) {
					stream.getTracks().forEach((t) => t.stop());
					return;
				}

				secStreamRef.current = stream;
				if (videoRefSec.current) {
					videoRefSec.current.srcObject = stream;
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
			secStreamRef.current?.getTracks().forEach((t) => t.stop());
			secStreamRef.current = null;
			secRecorderRef.current = null;
			setSecReady(false);
		};
	}, [deviceIdSec]);

	const startRecording = useCallback(
		(options: RecordingOptions) => {
			if (isStartingRef.current) return;
			isStartingRef.current = true;

			if (
				mainRecorderRef.current &&
				mainRecorderRef.current.state === "inactive"
			) {
				mainChunksRef.current = [];
				mainRecorderRef.current.start(1000);
			}

			if (deviceIdSec === "ws-realsense") {
				realSenseRef.current?.startRecording(options);
			} else if (
				secRecorderRef.current &&
				secRecorderRef.current.state === "inactive"
			) {
				secChunksRef.current = [];
				secRecorderRef.current.start(1000);
			}

			setIsRecording(true);

			setTimeout(() => {
				isStartingRef.current = false;
			}, 500);
		},
		[deviceIdSec],
	);

	const stopRecording = useCallback(async () => {
		await stopRecorderSafe(mainRecorderRef.current);

		if (deviceIdSec === "ws-realsense") {
			realSenseRef.current?.stopRecording();
		} else {
			await stopRecorderSafe(secRecorderRef.current);
		}

		setIsRecording(false);
		isStartingRef.current = false;

		return {
			blobMain: new Blob(mainChunksRef.current, { type: "video/webm" }),
			blobSec:
				deviceIdSec !== "ws-realsense"
					? new Blob(secChunksRef.current, { type: "video/webm" })
					: null,
		};
	}, [deviceIdSec]);

	const allReady = mainReady && secReady;

	return {
		videoDevices,
		isRecording,
		allReady,
		startRecording,
		stopRecording,

		deviceIdMain,
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

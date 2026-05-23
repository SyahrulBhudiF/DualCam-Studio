import type React from "react";
import { useEffect, useImperativeHandle, useRef } from "react";

export interface RealSenseHandle {
	startRecording: (options: {
		mode: string;
		folderName: string;
		fileName?: string;
	}) => Promise<string | null>;
	stopRecording: () => Promise<string | null>;
}

interface RealSenseCanvasProps {
	onReady?: () => void;
	ref?: React.Ref<RealSenseHandle>;
}

export function RealSenseCanvas({ onReady, ref }: RealSenseCanvasProps) {
	const localCanvasRef = useRef<HTMLCanvasElement>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const pendingRef = useRef(new Map<string, (result: string | null) => void>());
	const activePathRef = useRef<string | null>(null);

	const sendCommand = (payload: Record<string, unknown>) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			return Promise.resolve(null);
		}

		const requestId = crypto.randomUUID();
		return new Promise<string | null>((resolve) => {
			pendingRef.current.set(requestId, resolve);
			wsRef.current?.send(JSON.stringify({ ...payload, requestId }));
		});
	};

	useImperativeHandle(ref, () => ({
		startRecording: async (options) => {
			const path = await sendCommand({ action: "START", ...options });
			activePathRef.current = path;
			return path;
		},
		stopRecording: async () => {
			if (!activePathRef.current) return null;
			const path = await sendCommand({ action: "STOP" });
			activePathRef.current = null;
			return path;
		},
	}));

	useEffect(() => {
		const canvas = localCanvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d", { alpha: false });
		if (!ctx) return;

		wsRef.current = new WebSocket(
			import.meta.env.VITE_REALSENSE_WS_URL ?? "ws://localhost:8080",
		);
		const img = new Image();

		wsRef.current.onopen = () => {
			if (onReady) onReady();
		};

		wsRef.current.onmessage = (event) => {
			if (typeof event.data === "string") {
				const message = JSON.parse(event.data) as {
					requestId?: string;
					type?: string;
					path?: string;
				};
				if (message.requestId) {
					const resolve = pendingRef.current.get(message.requestId);
					pendingRef.current.delete(message.requestId);
					resolve?.(message.type === "ERROR" ? null : (message.path ?? null));
				}
				return;
			}

			const blob = event.data;
			const url = URL.createObjectURL(blob);
			img.onload = () => {
				ctx.drawImage(img, 0, 0, 640, 480);
				URL.revokeObjectURL(url);
			};
			img.src = url;
		};

		return () => {
			pendingRef.current.forEach((resolve) => resolve(null));
			pendingRef.current.clear();
			activePathRef.current = null;
			if (wsRef.current) {
				wsRef.current.close();
			}
		};
	}, [onReady]);

	return (
		<canvas
			ref={localCanvasRef}
			width={640}
			height={480}
			className="w-full h-full object-contain bg-foreground"
		/>
	);
}

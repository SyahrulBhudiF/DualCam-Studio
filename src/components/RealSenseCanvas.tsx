import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

export interface RealSenseHandle {
  startRecording: (options: {
    mode: string;
    folderName: string;
    fileName?: string;
  }) => void;
  stopRecording: () => void;
}

interface RealSenseCanvasProps {
  onReady?: () => void;
}

export const RealSenseCanvas = forwardRef<
  RealSenseHandle,
  RealSenseCanvasProps
>(({ onReady }, ref) => {
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const msgQueue = useRef<string[]>([]);

  const sendMessage = (msg: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
    } else {
      msgQueue.current.push(msg);
    }
  };

  useImperativeHandle(ref, () => ({
    startRecording: (options) => {
      const payload = JSON.stringify({ action: "START", ...options });
      sendMessage(payload);
    },
    stopRecording: () => {
      const payload = JSON.stringify({ action: "STOP" });
      sendMessage(payload);
    },
  }));

  useEffect(() => {
    const canvas = localCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    wsRef.current = new WebSocket("ws://localhost:8080");
    const img = new Image();

    wsRef.current.onopen = () => {
      while (msgQueue.current.length > 0) {
        const msg = msgQueue.current.shift();
        if (msg) wsRef.current?.send(msg);
      }
      if (onReady) onReady();
    };

    wsRef.current.onmessage = (event) => {
      const blob = event.data;
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 640, 480);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <canvas
      ref={localCanvasRef}
      width={640}
      height={480}
      className="w-full h-full object-contain bg-black"
    />
  );
});

RealSenseCanvas.displayName = "RealSenseCanvas";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

export interface RealSenseHandle {
  startRecording: (folderName: string) => void;
  stopRecording: () => void;
}

export const RealSenseCanvas = forwardRef<RealSenseHandle>((props, ref) => {
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useImperativeHandle(ref, () => ({
    startRecording: (folderName: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const payload = JSON.stringify({ action: "START", folderName });
        wsRef.current.send(payload);
      }
    },
    stopRecording: () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const payload = JSON.stringify({ action: "STOP" });
        wsRef.current.send(payload);
      }
    },
  }));

  useEffect(() => {
    const canvas = localCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    wsRef.current = new WebSocket("ws://localhost:8080");
    const img = new Image();

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
      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.close();
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

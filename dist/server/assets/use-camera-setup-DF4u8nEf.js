import { jsx, jsxs } from "react/jsx-runtime";
import { forwardRef, useRef, useImperativeHandle, useEffect, useState, useCallback } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import { c as cn } from "./supabase-0PR4I26a.js";
const RealSenseCanvas = forwardRef(({ onReady }, ref) => {
  const localCanvasRef = useRef(null);
  const wsRef = useRef(null);
  const msgQueue = useRef([]);
  const sendMessage = (msg) => {
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
    }
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
  }, [onReady]);
  return /* @__PURE__ */ jsx(
    "canvas",
    {
      ref: localCanvasRef,
      width: 640,
      height: 480,
      className: "w-full h-full object-contain bg-black"
    }
  );
});
RealSenseCanvas.displayName = "RealSenseCanvas";
function CameraControlPanel({
  videoDevices,
  deviceIdMain,
  setDeviceIdMain,
  deviceIdSec,
  setDeviceIdSec,
  videoRefMain,
  videoRefSec,
  realSenseRef,
  isRecording,
  onSecReady
}) {
  return /* @__PURE__ */ jsxs("div", { className: "fixed bottom-4 right-4 flex flex-row gap-4 z-50 items-end", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded shadow text-[10px] font-bold text-center border border-slate-200 dark:border-slate-800 dark:text-slate-200", children: "Main Cam (Audio ON)" }),
      /* @__PURE__ */ jsx(
        "select",
        {
          className: "w-48 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded p-1 shadow-sm dark:text-slate-200",
          value: deviceIdMain,
          onChange: (e) => setDeviceIdMain(e.target.value),
          children: videoDevices.map((d, idx) => /* @__PURE__ */ jsx("option", { value: d.deviceId, children: d.label || `Cam ${d.deviceId.substring(0, 5)}...` }, `main-${d.deviceId}-${idx}`))
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-xl", children: /* @__PURE__ */ jsx(
        "video",
        {
          ref: videoRefMain,
          autoPlay: true,
          muted: true,
          playsInline: true,
          className: "w-full h-full object-cover"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-blue-100/90 dark:bg-blue-950/90 backdrop-blur px-2 py-1 rounded shadow text-[10px] font-bold text-center text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900", children: "Secondary / D415" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "w-48 text-xs bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-900 rounded p-1 shadow-sm dark:text-slate-200",
          value: deviceIdSec,
          onChange: (e) => setDeviceIdSec(e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "-- Turn Off --" }),
            /* @__PURE__ */ jsx("option", { value: "ws-realsense", className: "font-bold text-blue-600", children: "⚡ RealSense (Lossless Rec)" }),
            videoDevices.map((d, idx) => /* @__PURE__ */ jsxs("option", { value: d.deviceId, children: [
              idx + 1,
              ". ",
              d.label || `Cam ${d.deviceId.substring(0, 5)}...`
            ] }, `sec-${d.deviceId}-${idx}`))
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-blue-500 shadow-xl relative group", children: [
        deviceIdSec === "ws-realsense" ? /* @__PURE__ */ jsx(RealSenseCanvas, { ref: realSenseRef, onReady: onSecReady }) : /* @__PURE__ */ jsx(
          "video",
          {
            ref: videoRefSec,
            autoPlay: true,
            muted: true,
            playsInline: true,
            className: "w-full h-full object-cover"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full transition-opacity ${isRecording ? "opacity-100 animate-pulse" : "opacity-0"}`,
            children: "REC"
          }
        ),
        !deviceIdSec && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center text-white/50 text-xs", children: "No Signal" })
      ] })
    ] })
  ] });
}
function RadioGroup({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Root,
    {
      "data-slot": "radio-group",
      className: cn("grid gap-3", className),
      ...props
    }
  );
}
function RadioGroupItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Item,
    {
      "data-slot": "radio-group-item",
      className: cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        RadioGroupPrimitive.Indicator,
        {
          "data-slot": "radio-group-indicator",
          className: "relative flex items-center justify-center",
          children: /* @__PURE__ */ jsx(CircleIcon, { className: "fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" })
        }
      )
    }
  );
}
const stopRecorderSafe = (recorder) => {
  return new Promise((resolve) => {
    if (!recorder || recorder.state === "inactive") {
      resolve();
      return;
    }
    recorder.onstop = () => resolve();
    recorder.stop();
  });
};
function useCameraUnit(defaultDeviceId = "") {
  const [deviceId, setDeviceId] = useState(defaultDeviceId);
  const [isReady, setReady] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
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
    chunksRef
  };
}
function useCameraSetup() {
  const [videoDevices, setVideoDevices] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const isStartingRef = useRef(false);
  const main = useCameraUnit("");
  const sec = useCameraUnit("ws-realsense");
  const realSenseRef = useRef(null);
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
            height: { ideal: 480 }
          },
          audio: true
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
            height: { ideal: 480 }
          },
          audio: false
        });
        sec.setStream(stream);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm"
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
    (options) => {
      if (isStartingRef.current) return;
      isStartingRef.current = true;
      if (main.recorderRef.current && main.recorderRef.current.state === "inactive") {
        main.chunksRef.current = [];
        main.recorderRef.current.start(1e3);
      }
      if (sec.deviceId === "ws-realsense") {
        realSenseRef.current?.startRecording(options);
      } else if (sec.recorderRef.current && sec.recorderRef.current.state === "inactive") {
        sec.chunksRef.current = [];
        sec.recorderRef.current.start(1e3);
      }
      setIsRecording(true);
      setTimeout(() => {
        isStartingRef.current = false;
      }, 500);
    },
    [sec.deviceId]
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
      blobSec: sec.deviceId !== "ws-realsense" ? new Blob(sec.chunksRef.current, { type: "video/webm" }) : null
    };
  }, [sec.deviceId]);
  const allReady = main.isReady && (sec.deviceId === "ws-realsense" ? sec.isReady : sec.isReady);
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
    realSenseRef
  };
}
export {
  CameraControlPanel as C,
  RadioGroup as R,
  RadioGroupItem as a,
  useCameraSetup as u
};

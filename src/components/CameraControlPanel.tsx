import type React from "react";
import {
	RealSenseCanvas,
	type RealSenseHandle,
} from "@/components/RealSenseCanvas";

interface CameraControlPanelProps {
	videoDevices: MediaDeviceInfo[];
	deviceIdMain: string;
	setDeviceIdMain: (id: string) => void;
	deviceIdSec: string;
	setDeviceIdSec: (id: string) => void;
	videoRefMain: React.RefObject<HTMLVideoElement | null>;
	videoRefSec: React.RefObject<HTMLVideoElement | null>;
	realSenseRef: React.RefObject<RealSenseHandle | null>;
	isRecording: boolean;
	onSecReady: () => void;
}

export function CameraControlPanel({
	videoDevices,
	deviceIdMain,
	setDeviceIdMain,
	deviceIdSec,
	setDeviceIdSec,
	videoRefMain,
	videoRefSec,
	realSenseRef,
	isRecording,
	onSecReady,
}: CameraControlPanelProps) {
	return (
		<div className="fixed bottom-4 right-4 flex flex-row gap-4 z-50 items-end">
			<div className="flex flex-col gap-2">
				<div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded shadow text-[10px] font-bold text-center border border-slate-200 dark:border-slate-800 dark:text-slate-200">
					Main Cam (Audio ON)
				</div>
				<select
					className="w-48 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded p-1 shadow-sm dark:text-slate-200"
					value={deviceIdMain}
					onChange={(e) => setDeviceIdMain(e.target.value)}
				>
					{videoDevices.map((d, idx) => (
						<option key={`main-${d.deviceId}-${idx}`} value={d.deviceId}>
							{d.label || `Cam ${d.deviceId.substring(0, 5)}...`}
						</option>
					))}
				</select>
				<div className="w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-xl">
					<video
						ref={videoRefMain}
						autoPlay
						muted
						playsInline
						className="w-full h-full object-cover"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="bg-blue-100/90 dark:bg-blue-950/90 backdrop-blur px-2 py-1 rounded shadow text-[10px] font-bold text-center text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
					Secondary / D415
				</div>
				<select
					className="w-48 text-xs bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-900 rounded p-1 shadow-sm dark:text-slate-200"
					value={deviceIdSec}
					onChange={(e) => setDeviceIdSec(e.target.value)}
				>
					<option value="">-- Turn Off --</option>
					<option value="ws-realsense" className="font-bold text-blue-600">
						⚡ RealSense (Lossless Rec)
					</option>
					{videoDevices.map((d, idx) => (
						<option key={`sec-${d.deviceId}-${idx}`} value={d.deviceId}>
							{idx + 1}. {d.label || `Cam ${d.deviceId.substring(0, 5)}...`}
						</option>
					))}
				</select>
				<div className="w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-blue-500 shadow-xl relative group">
					{deviceIdSec === "ws-realsense" ? (
						<RealSenseCanvas ref={realSenseRef} onReady={onSecReady} />
					) : (
						<video
							ref={videoRefSec}
							autoPlay
							muted
							playsInline
							className="w-full h-full object-cover"
						/>
					)}
					<div
						className={`absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full transition-opacity ${isRecording ? "opacity-100 animate-pulse" : "opacity-0"}`}
					>
						REC
					</div>
					{!deviceIdSec && (
						<div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs">
							No Signal
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

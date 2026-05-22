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
	setDeviceIdSec?: (id: string) => void;
	videoRefMain: React.RefObject<HTMLVideoElement | null>;
	videoRefSec: React.RefObject<HTMLVideoElement | null>;
	realSenseRef: React.RefObject<RealSenseHandle | null>;
	isRecording: boolean;
	onSecReady: () => void;
	secondarySelect?: boolean;
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
	secondarySelect = true,
}: CameraControlPanelProps) {
	return (
		<div className="fixed bottom-4 right-4 flex flex-row gap-4 z-50 items-end">
			<div className="flex flex-col gap-2">
				<div className="bg-card/90 backdrop-blur px-2 py-1 rounded shadow text-[10px] font-bold text-center border border-border text-card-foreground">
					Main Cam (Audio ON)
				</div>
				<label htmlFor="main-camera-select" className="sr-only">
					Main camera
				</label>
				<select
					id="main-camera-select"
					aria-label="Main camera"
					className="w-48 text-xs bg-card border border-border rounded p-1 shadow-sm dark:text-foreground"
					value={deviceIdMain}
					onChange={(e) => setDeviceIdMain(e.target.value)}
				>
					{videoDevices.map((d) => (
						<option key={`main-${d.deviceId}`} value={d.deviceId}>
							{d.label || `Cam ${d.deviceId.substring(0, 5)}…`}
						</option>
					))}
				</select>
				<div className="w-48 h-36 bg-foreground rounded-lg overflow-hidden border-2 border-border shadow-xl">
					<video
						aria-label="Main camera preview"
						ref={videoRefMain}
						autoPlay
						muted
						playsInline
						className="w-full h-full object-cover"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="bg-primary/15 backdrop-blur px-2 py-1 rounded shadow text-[10px] font-bold text-center text-primary border border-primary/30">
					Secondary / D415
				</div>
				{secondarySelect ? (
					<>
						<label htmlFor="secondary-camera-select" className="sr-only">
							Secondary camera
						</label>
						<select
							id="secondary-camera-select"
							aria-label="Secondary camera"
							className="w-48 text-xs bg-card border border-primary/40 rounded p-1 shadow-sm dark:text-foreground"
							value={deviceIdSec}
							onChange={(e) => setDeviceIdSec?.(e.target.value)}
						>
							<option value="">-- Turn Off --</option>
							<option value="ws-realsense" className="font-bold text-primary">
								RealSense (Lossless Rec)
							</option>
							{videoDevices.map((d) => (
								<option key={`sec-${d.deviceId}`} value={d.deviceId}>
									{d.label || `Cam ${d.deviceId.substring(0, 5)}…`}
								</option>
							))}
						</select>
					</>
				) : (
					<div className="w-48 text-xs bg-card border border-primary/40 rounded p-1 shadow-sm dark:text-foreground text-center">
						RealSense (Lossless Rec)
					</div>
				)}
				<div className="w-48 h-36 bg-foreground rounded-lg overflow-hidden border-2 border-primary shadow-xl relative group">
					{deviceIdSec === "ws-realsense" ? (
						<RealSenseCanvas ref={realSenseRef} onReady={onSecReady} />
					) : (
						<video
							aria-label="Secondary camera preview"
							ref={videoRefSec}
							autoPlay
							muted
							playsInline
							className="w-full h-full object-cover"
						/>
					)}
					<div
						className={`absolute top-2 left-2 px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full transition-opacity ${isRecording ? "opacity-100 animate-pulse" : "opacity-0"}`}
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

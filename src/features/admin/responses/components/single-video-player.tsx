import {
	Download,
	FileVideo,
	Maximize,
	Pause,
	Play,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type SingleVideoPlayerProps = {
	src: string;
	title?: string;
};

/**
 * Check if the video format requires download (not supported by browser)
 */
function isDownloadOnlyFormat(src: string): boolean {
	const downloadOnlyExtensions = [".avi", ".mov", ".wmv", ".flv", ".mkv"];
	const lowerSrc = src.toLowerCase();
	return downloadOnlyExtensions.some((ext) => lowerSrc.endsWith(ext));
}

/**
 * Get filename from src path
 */
function getFilename(src: string): string {
	const parts = src.split("/");
	return parts[parts.length - 1] || "video";
}

/**
 * Get file extension
 */
function getExtension(src: string): string {
	const parts = src.split(".");
	return parts[parts.length - 1]?.toUpperCase() || "VIDEO";
}

export function SingleVideoPlayer({ src, title }: SingleVideoPlayerProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [hasError, setHasError] = useState(false);

	const isDownloadOnly = isDownloadOnlyFormat(src);

	const handlePlayPause = () => {
		const video = videoRef.current;
		if (!video) return;

		if (isPlaying) {
			video.pause();
		} else {
			video.play();
		}
		setIsPlaying(!isPlaying);
	};

	const handleMuteToggle = () => {
		const video = videoRef.current;
		if (!video) return;
		video.muted = !isMuted;
		setIsMuted(!isMuted);
	};

	const handleFullscreen = () => {
		const video = videoRef.current;
		if (!video) return;
		if (video.requestFullscreen) {
			video.requestFullscreen();
		}
	};

	const handleDownload = () => {
		const link = document.createElement("a");
		link.href = src;
		link.download = getFilename(src);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Show download-only UI for AVI and other non-browser formats
	if (isDownloadOnly) {
		return (
			<div className="space-y-3">
				<div className="relative rounded-lg overflow-hidden bg-muted aspect-video flex flex-col items-center justify-center p-4">
					<FileVideo className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3" />
					<p className="text-sm sm:text-base font-medium text-center mb-1">
						{getExtension(src)} Video (Raw Dataset)
					</p>
					<p className="text-xs sm:text-sm text-muted-foreground text-center mb-4 px-2">
						{getFilename(src)}
					</p>
					<Button
						onClick={handleDownload}
						className="cursor-pointer"
						size="default"
					>
						<Download className="h-4 w-4 mr-2" />
						Download {getExtension(src)}
					</Button>
				</div>
				{title && (
					<p className="text-xs text-muted-foreground text-center">{title}</p>
				)}
			</div>
		);
	}

	// Show error state if video fails to load
	if (hasError) {
		return (
			<div className="space-y-3">
				<div className="relative rounded-lg overflow-hidden bg-muted aspect-video flex flex-col items-center justify-center p-4">
					<FileVideo className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3" />
					<p className="text-sm sm:text-base font-medium text-center mb-1">
						Video tidak tersedia
					</p>
					<p className="text-xs sm:text-sm text-muted-foreground text-center mb-4">
						File mungkin belum ada atau path salah
					</p>
					<Button
						onClick={handleDownload}
						variant="outline"
						className="cursor-pointer"
						size="sm"
					>
						<Download className="h-4 w-4 mr-2" />
						Coba Download
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="relative rounded-lg overflow-hidden bg-black aspect-video">
				<video
					ref={videoRef}
					src={src || undefined}
					className="w-full h-full object-contain"
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
					onEnded={() => setIsPlaying(false)}
					onError={() => setHasError(true)}
				>
					<track kind="captions" />
				</video>
			</div>
			<div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
				<Button
					variant="outline"
					size="sm"
					onClick={handlePlayPause}
					className="cursor-pointer"
				>
					{isPlaying ? (
						<Pause className="h-4 w-4" />
					) : (
						<Play className="h-4 w-4" />
					)}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleMuteToggle}
					className="cursor-pointer"
				>
					{isMuted ? (
						<VolumeX className="h-4 w-4" />
					) : (
						<Volume2 className="h-4 w-4" />
					)}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleFullscreen}
					className="cursor-pointer"
				>
					<Maximize className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleDownload}
					className="cursor-pointer"
				>
					<Download className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}

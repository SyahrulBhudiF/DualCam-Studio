import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type SingleVideoPlayerProps = {
	src: string;
	title?: string;
};

export function SingleVideoPlayer({ src }: SingleVideoPlayerProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);

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
				>
					<track kind="captions" />
				</video>
			</div>
			<div className="flex items-center justify-center gap-2">
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
			</div>
		</div>
	);
}

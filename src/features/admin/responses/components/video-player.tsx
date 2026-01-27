import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VideoPath } from "../responses.types";
import { SingleVideoPlayer } from "./single-video-player";

type VideoPlayerProps = {
	videoPath: VideoPath | null;
};

export function VideoPlayer({ videoPath }: VideoPlayerProps) {
	if (!videoPath) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Video Recording</CardTitle>
					<CardDescription>
						No video available for this response
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-48 bg-muted rounded-lg">
						<span className="text-muted-foreground">No video recorded</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	const hasMain = videoPath.main && videoPath.main !== "null";
	const hasSecondary = videoPath.secondary && videoPath.secondary !== "null";

	if (!hasMain && !hasSecondary) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Video Recording</CardTitle>
					<CardDescription>
						No video available for this response
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-48 bg-muted rounded-lg">
						<span className="text-muted-foreground">No video recorded</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	const mainSrc = videoPath.main ?? "";
	const secondarySrc = videoPath.secondary ?? "";

	if (hasMain && !hasSecondary) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Video Recording</CardTitle>
					<CardDescription>Main camera recording</CardDescription>
				</CardHeader>
				<CardContent>
					<SingleVideoPlayer src={mainSrc} title="Main Camera" />
				</CardContent>
			</Card>
		);
	}

	if (!hasMain && hasSecondary) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Video Recording</CardTitle>
					<CardDescription>Secondary camera recording</CardDescription>
				</CardHeader>
				<CardContent>
					<SingleVideoPlayer src={secondarySrc} title="Secondary Camera" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Video Recording</CardTitle>
				<CardDescription>View recordings from both cameras</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="main">
					<TabsList className="mb-4">
						<TabsTrigger value="main">Main Camera</TabsTrigger>
						<TabsTrigger value="secondary">Secondary Camera</TabsTrigger>
						<TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
					</TabsList>
					<TabsContent value="main">
						<SingleVideoPlayer src={mainSrc} title="Main Camera" />
					</TabsContent>
					<TabsContent value="secondary">
						<SingleVideoPlayer src={secondarySrc} title="Secondary Camera" />
					</TabsContent>
					<TabsContent value="side-by-side">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<h4 className="text-sm font-medium mb-2">Main Camera</h4>
								<SingleVideoPlayer src={mainSrc} title="Main Side" />
							</div>
							<div>
								<h4 className="text-sm font-medium mb-2">Secondary Camera</h4>
								<SingleVideoPlayer src={secondarySrc} title="Secondary Side" />
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}

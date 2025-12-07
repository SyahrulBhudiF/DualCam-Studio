import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	ResponseDetailItem,
	SegmentedVideoPath,
} from "../responses.types";
import { SingleVideoPlayer } from "./single-video-player";

type SegmentedVideoPlayerProps = {
	videos: SegmentedVideoPath[];
	details: ResponseDetailItem[];
};

export function SegmentedVideoPlayer({
	videos,
	details,
}: SegmentedVideoPlayerProps) {
	const [selectedQuestion, setSelectedQuestion] = useState<string>(
		videos.length > 0 ? videos[0].questionId : "",
	);

	if (videos.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Video Recording</CardTitle>
					<CardDescription>Segmented video recordings</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-48 bg-muted rounded-lg">
						<span className="text-muted-foreground">
							No segmented videos available
						</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	const selectedVideo = videos.find((v) => v.questionId === selectedQuestion);
	const selectedDetail = details.find((d) => d.questionId === selectedQuestion);

	const getQuestionLabel = (video: SegmentedVideoPath) => {
		const detail = details.find((d) => d.questionId === video.questionId);
		const questionText =
			detail?.questionText ?? `Question ${video.questionNumber}`;
		const truncated =
			questionText.length > 40
				? `${questionText.substring(0, 40)}...`
				: questionText;
		return `Q${video.questionNumber}: ${truncated}`;
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Segmented Video Recordings</CardTitle>
						<CardDescription>
							Video recordings per question ({videos.length} questions)
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a question" />
					</SelectTrigger>
					<SelectContent>
						{videos.map((video) => (
							<SelectItem key={video.questionId} value={video.questionId}>
								{getQuestionLabel(video)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{selectedVideo && (
					<div className="space-y-4">
						{selectedDetail && (
							<div className="p-3 bg-muted rounded-lg">
								<div className="text-xs text-muted-foreground mb-1">
									Question {selectedVideo.questionNumber}
								</div>
								<div className="text-sm font-medium">
									{selectedDetail.questionText}
								</div>
								{selectedDetail.answerText && (
									<div className="text-xs text-muted-foreground mt-2">
										Answer: {selectedDetail.answerText} (Score:{" "}
										{selectedDetail.score})
									</div>
								)}
							</div>
						)}

						<Tabs defaultValue="main">
							<TabsList className="mb-4">
								<TabsTrigger value="main">Main Camera</TabsTrigger>
								<TabsTrigger value="secondary">Secondary Camera</TabsTrigger>
								<TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
							</TabsList>
							<TabsContent value="main">
								{selectedVideo.main ? (
									<SingleVideoPlayer
										src={selectedVideo.main}
										title={`Q${selectedVideo.questionNumber} Main`}
									/>
								) : (
									<div className="flex items-center justify-center h-48 bg-muted rounded-lg">
										<span className="text-muted-foreground">
											Main video not available
										</span>
									</div>
								)}
							</TabsContent>
							<TabsContent value="secondary">
								{selectedVideo.secondary ? (
									<SingleVideoPlayer
										src={selectedVideo.secondary}
										title={`Q${selectedVideo.questionNumber} Secondary`}
									/>
								) : (
									<div className="flex items-center justify-center h-48 bg-muted rounded-lg">
										<span className="text-muted-foreground">
											Secondary video not available
										</span>
									</div>
								)}
							</TabsContent>
							<TabsContent value="side-by-side">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<h4 className="text-sm font-medium mb-2">Main Camera</h4>
										{selectedVideo.main ? (
											<SingleVideoPlayer
												src={selectedVideo.main}
												title={`Q${selectedVideo.questionNumber} Main Side`}
											/>
										) : (
											<div className="flex items-center justify-center h-32 bg-muted rounded-lg">
												<span className="text-muted-foreground text-sm">
													Not available
												</span>
											</div>
										)}
									</div>
									<div>
										<h4 className="text-sm font-medium mb-2">
											Secondary Camera
										</h4>
										{selectedVideo.secondary ? (
											<SingleVideoPlayer
												src={selectedVideo.secondary}
												title={`Q${selectedVideo.questionNumber} Secondary Side`}
											/>
										) : (
											<div className="flex items-center justify-center h-32 bg-muted rounded-lg">
												<span className="text-muted-foreground text-sm">
													Not available
												</span>
											</div>
										)}
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

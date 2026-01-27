import { CheckCircle, Video } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ResponseDetailItem, VideoData } from "../responses.types";
import { SingleVideoPlayer } from "./single-video-player";

type ResponseAnswersProps = {
	details: ResponseDetailItem[];
	totalScore: number;
	videoData?: VideoData;
};

export function ResponseAnswers({
	details,
	totalScore,
	videoData,
}: ResponseAnswersProps) {
	const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
		null,
	);

	const sortedDetails = [...details].sort(
		(a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0),
	);

	const maxPossibleScore = details.reduce(
		(acc, d) => acc + (d.maxScore ?? 0),
		0,
	);

	const isSegmented = videoData?.mode === "segmented";

	const getVideoForQuestion = (questionId: string) => {
		if (!isSegmented || !videoData?.segmentedVideos) return null;
		return videoData.segmentedVideos.find((v) => v.questionId === questionId);
	};

	const selectedVideo = selectedQuestionId
		? getVideoForQuestion(selectedQuestionId)
		: null;
	const selectedDetail = selectedQuestionId
		? details.find((d) => d.questionId === selectedQuestionId)
		: null;

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Response Answers</CardTitle>
							<CardDescription>
								All answers submitted for this questionnaire
								{isSegmented && " (with video per question)"}
							</CardDescription>
						</div>
						<div className="text-right">
							<div className="text-2xl font-bold">{totalScore}</div>
							<div className="text-xs text-muted-foreground">
								Total Score {maxPossibleScore > 0 && `/ ${maxPossibleScore}`}
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{details.length === 0 ? (
						<div className="flex items-center justify-center h-32 text-muted-foreground">
							No answer details available
						</div>
					) : (
						<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[60px]">#</TableHead>
									<TableHead>Question</TableHead>
									<TableHead>Answer</TableHead>
									<TableHead className="w-[100px] text-right">Score</TableHead>
									{isSegmented && (
										<TableHead className="w-[80px] text-center">
											Video
										</TableHead>
									)}
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedDetails.map((detail, index) => {
									const hasVideo =
										isSegmented && getVideoForQuestion(detail.questionId);
									return (
										<TableRow key={detail.id}>
											<TableCell className="font-medium">
												{detail.orderNumber ?? index + 1}
											</TableCell>
											<TableCell>
												<div className="max-w-md break-words">
													{detail.questionText ?? "-"}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
													<span className="break-words">{detail.answerText ?? "-"}</span>
												</div>
											</TableCell>
											<TableCell className="text-right">
												<Badge
													variant={detail.score > 0 ? "default" : "secondary"}
												>
													{detail.score}
												</Badge>
											</TableCell>
											{isSegmented && (
												<TableCell className="text-center">
													{hasVideo ? (
														<Button
															variant="ghost"
															size="sm"
															className="cursor-pointer"
															onClick={() =>
																setSelectedQuestionId(detail.questionId)
															}
														>
															<Video className="h-4 w-4" />
														</Button>
													) : (
														<span className="text-muted-foreground text-xs">
															-
														</span>
													)}
												</TableCell>
											)}
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog
				open={!!selectedQuestionId}
				onOpenChange={(open) => !open && setSelectedQuestionId(null)}
			>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>
							Question {selectedDetail?.orderNumber ?? ""} Video
						</DialogTitle>
					</DialogHeader>
					{selectedDetail && (
						<div className="p-3 bg-muted rounded-lg mb-4">
							<div className="text-sm font-medium">
								{selectedDetail.questionText}
							</div>
							<div className="text-xs text-muted-foreground mt-1">
								Answer: {selectedDetail.answerText} (Score:{" "}
								{selectedDetail.score})
							</div>
						</div>
					)}
					{selectedVideo && (
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
										title="Main Camera"
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
										title="Secondary Camera"
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
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<h4 className="text-sm font-medium mb-2">Main Camera</h4>
										{selectedVideo.main ? (
											<SingleVideoPlayer
												src={selectedVideo.main}
												title="Main Side"
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
												title="Secondary Side"
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
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

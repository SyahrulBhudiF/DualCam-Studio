import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "./components/profile-card";
import { ResponseAnswers } from "./components/response-answers";
import { ExportResponseDetailButton } from "./components/response-export";
import { SegmentedVideoPlayer } from "./components/segmented-video-player";
import { VideoPlayer } from "./components/video-player";
import type {
	ResponseDetail as ResponseDetailType,
	SegmentedVideoPath,
	VideoData,
} from "./responses.types";

/**
 * Convert a video path from storage format to API URL
 * e.g. "/video_uploads/folder/file.webm" -> "/api/video/folder/file.webm"
 * or "video_uploads/folder/file.webm" -> "/api/video/folder/file.webm"
 */
function toVideoApiUrl(videoPath: string | null): string | null {
	if (!videoPath || videoPath === "null") return null;

	// Remove leading slash and "video_uploads/" prefix if present
	let cleanPath = videoPath;
	if (cleanPath.startsWith("/")) {
		cleanPath = cleanPath.slice(1);
	}
	if (cleanPath.startsWith("video_uploads/")) {
		cleanPath = cleanPath.slice("video_uploads/".length);
	}

	return `/api/video/${cleanPath}`;
}

/**
 * Build fallback video paths for segmented mode when video_segment_path is null
 * Based on the folder structure: video_uploads/{folderName}/q{number}/{userName}_{questionNumber}_{questionId}_main.webm
 */
function buildFallbackSegmentedPath(
	folderName: string,
	questionNumber: number,
	questionId: string,
	userName: string | null,
): { main: string | null; secondary: string | null } {
	// Clean the folder name - remove "segmented/" prefix if present for building path
	let basePath = folderName;
	if (!basePath.startsWith("segmented/")) {
		basePath = `segmented/${basePath}`;
	}

	const subFolder = `q${questionNumber}`;
	const safeName = (userName || "Anon").replace(/[^a-z0-9]/gi, "_");

	// Build paths based on naming convention from segmented-upload.ts
	const mainPath = `/api/video/${basePath}/${subFolder}/${safeName}_${questionNumber}_${questionId}_main.webm`;
	const secondaryPath = `/api/video/${basePath}/${subFolder}/${safeName}_${questionNumber}_${questionId}_sec.avi`;

	return {
		main: mainPath,
		secondary: secondaryPath,
	};
}

/**
 * Check if the video_path indicates segmented mode
 * Segmented mode: video_path is just a folder name (e.g. "segmented/ahmad_123")
 * Full mode: video_path is JSON with main/secondary paths
 */
function isSegmentedMode(videoPathString: string | null): boolean {
	if (!videoPathString || videoPathString === "null") return false;

	// Try to parse as JSON - if it's valid JSON with main/secondary, it's full mode
	try {
		const parsed = JSON.parse(videoPathString);
		if (parsed && (parsed.main || parsed.secondary)) {
			return false; // It's full mode with JSON paths
		}
	} catch {
		// Not JSON, could be segmented folder name
	}

	// Check if it looks like a segmented folder path
	return (
		videoPathString.includes("segmented") || !videoPathString.includes("{")
	);
}

type ResponseDetailProps = {
	response: ResponseDetailType;
};

function parseVideoData(
	videoPathString: string | null,
	details: ResponseDetailType["details"],
	profileName: string | null,
): VideoData {
	if (!videoPathString || videoPathString === "null") {
		return { mode: "full", fullVideo: undefined };
	}

	// Check if any details have video_segment_path filled
	const hasSegmentedVideosInDb = details.some(
		(d) => d.videoSegmentPath && d.videoSegmentPath !== "null",
	);

	// If video_segment_path exists in DB, use it
	if (hasSegmentedVideosInDb) {
		const segmentedVideos: SegmentedVideoPath[] = details
			.filter((d) => d.videoSegmentPath && d.videoSegmentPath !== "null")
			.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
			.map((detail, index) => {
				let main: string | null = null;
				let secondary: string | null = null;

				try {
					if (!detail.videoSegmentPath) {
						throw new Error("videoSegmentPath is missing");
					}

					const parsed = JSON.parse(detail.videoSegmentPath);

					main = toVideoApiUrl(parsed.main ?? null);
					secondary = toVideoApiUrl(parsed.secondary ?? null);
				} catch {
					main = toVideoApiUrl(detail.videoSegmentPath);
				}

				return {
					questionId: detail.questionId,
					questionNumber: detail.orderNumber ?? index + 1,
					main,
					secondary,
				};
			});

		return {
			mode: "segmented",
			segmentedVideos,
		};
	}

	// Check if this is segmented mode based on video_path format
	if (isSegmentedMode(videoPathString)) {
		// Fallback: Build video paths from folder structure
		const segmentedVideos: SegmentedVideoPath[] = details
			.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
			.map((detail, index) => {
				const questionNumber = detail.orderNumber ?? index + 1;
				const paths = buildFallbackSegmentedPath(
					videoPathString,
					questionNumber,
					detail.questionId,
					profileName,
				);

				return {
					questionId: detail.questionId,
					questionNumber,
					main: paths.main,
					secondary: paths.secondary,
				};
			});

		return {
			mode: "segmented",
			segmentedVideos,
		};
	}

	// Full mode - parse JSON
	try {
		const parsed = JSON.parse(videoPathString);

		return {
			mode: "full",
			fullVideo: {
				main: toVideoApiUrl(parsed.main ?? null),
				secondary: toVideoApiUrl(parsed.secondary ?? null),
			},
		};
	} catch {
		return {
			mode: "full",
			fullVideo: {
				main: toVideoApiUrl(videoPathString),
				secondary: null,
			},
		};
	}
}

export function ResponseDetail({ response }: ResponseDetailProps) {
	const videoData = parseVideoData(
		response.videoPath,
		response.details,
		response.profile?.name ?? null,
	);

	return (
		<Main className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
					<Link to="/admin/responses">
						<Button variant="ghost" size="sm" className="cursor-pointer w-fit">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Responses
						</Button>
					</Link>
					<div>
						<h2 className="text-xl sm:text-2xl font-bold tracking-tight">
							Response Detail
						</h2>
						<p className="text-sm text-muted-foreground">
							View complete response information
						</p>
					</div>
				</div>
				<ExportResponseDetailButton response={response} />
			</div>

			<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
				<ProfileCard
					profile={response.profile}
					createdAt={response.createdAt}
					questionnaireTitle={response.questionnaire?.title ?? null}
				/>
				{videoData.mode === "full" ? (
					<VideoPlayer videoPath={videoData.fullVideo ?? null} />
				) : (
					<SegmentedVideoPlayer
						videos={videoData.segmentedVideos ?? []}
						details={response.details}
					/>
				)}
			</div>

			<ResponseAnswers
				details={response.details}
				totalScore={response.totalScore}
				videoData={videoData}
			/>
		</Main>
	);
}

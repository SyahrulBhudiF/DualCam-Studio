import { Schema } from "effect";
import { describe, expect, it } from "vitest";
import {
	CreateVideoPredictionSchema,
	PublicVideoPredictionAccessSchema,
} from "@/infrastructure/schemas/prediction";

describe("video prediction schemas", () => {
	it("accepts public token access input", () => {
		const input = Schema.decodeUnknownSync(PublicVideoPredictionAccessSchema)({
			predictionId: "prediction-1",
			token: "token-1",
		});

		expect(input).toEqual({ predictionId: "prediction-1", token: "token-1" });
	});

	it("accepts single uploaded local video metadata", () => {
		const input = Schema.decodeUnknownSync(CreateVideoPredictionSchema)({
			format: "webm",
			mimeType: "video/webm",
			sizeBytes: 123,
			videoPath: "/video_uploads/predict-video/sample.webm",
		});

		expect(input.videoPath).toBe("/video_uploads/predict-video/sample.webm");
	});
});

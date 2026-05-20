CREATE TABLE "prediction_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"response_id" uuid NOT NULL,
	"response_detail_id" uuid,
	"question_id" text NOT NULL,
	"video_kind" text NOT NULL,
	"video_path" text NOT NULL,
	"video_format" text,
	"video_mime_type" text,
	"model_exp_name" text,
	"model_seed" integer,
	"model_version" text,
	"label" text,
	"probability_anxiety_tinggi" double precision,
	"threshold" double precision,
	"aggregation" text,
	"frame_count" integer,
	"duration_seconds" double precision,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_prediction_results_response_id" ON "prediction_results" ("response_id");--> statement-breakpoint
CREATE INDEX "idx_prediction_results_response_detail_id" ON "prediction_results" ("response_detail_id");--> statement-breakpoint
CREATE INDEX "idx_prediction_results_status" ON "prediction_results" ("status");--> statement-breakpoint
ALTER TABLE "prediction_results" ADD CONSTRAINT "prediction_results_response_id_responses_id_fkey" FOREIGN KEY ("response_id") REFERENCES "responses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prediction_results" ADD CONSTRAINT "prediction_results_response_detail_id_response_details_id_fkey" FOREIGN KEY ("response_detail_id") REFERENCES "response_details"("id") ON DELETE CASCADE;
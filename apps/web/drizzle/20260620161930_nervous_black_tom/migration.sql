CREATE TABLE "video_prediction_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"prediction_id" uuid NOT NULL,
	"event_no" integer NOT NULL,
	"onset_frame" integer NOT NULL,
	"apex_frame" integer NOT NULL,
	"offset_frame" integer NOT NULL,
	"onset_time_seconds" double precision,
	"apex_time_seconds" double precision,
	"offset_time_seconds" double precision,
	"duration_frames" integer NOT NULL,
	"duration_seconds" double precision,
	"probability_anxiety_tinggi" double precision NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_prediction_frames" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"prediction_id" uuid NOT NULL,
	"frame_index" integer NOT NULL,
	"signal_index" integer,
	"time_seconds" double precision,
	"probability_anxiety_tinggi" double precision NOT NULL,
	"label" text NOT NULL,
	"raw_magnitude" double precision,
	"smoothed_magnitude" double precision,
	"height_threshold" double precision,
	"event_no" integer,
	"event_marker" text
);
--> statement-breakpoint
CREATE TABLE "video_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"video_path" text NOT NULL,
	"video_format" text,
	"video_mime_type" text,
	"video_size_bytes" integer,
	"access_token_hash" text NOT NULL,
	"access_token_expires_at" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"label" text,
	"probability_anxiety_tinggi" double precision,
	"threshold" double precision,
	"aggregation" text,
	"model_exp_name" text,
	"model_version" text,
	"frame_count" integer,
	"duration_seconds" double precision,
	"fps" double precision,
	"event_count" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_video_prediction_events_prediction_id" ON "video_prediction_events" ("prediction_id");--> statement-breakpoint
CREATE INDEX "idx_video_prediction_frames_prediction_id" ON "video_prediction_frames" ("prediction_id");--> statement-breakpoint
CREATE INDEX "idx_video_prediction_frames_prediction_time" ON "video_prediction_frames" ("prediction_id","time_seconds");--> statement-breakpoint
CREATE INDEX "idx_video_predictions_status" ON "video_predictions" ("status");--> statement-breakpoint
CREATE INDEX "idx_video_predictions_created_at" ON "video_predictions" ("created_at");--> statement-breakpoint
ALTER TABLE "video_prediction_events" ADD CONSTRAINT "video_prediction_events_prediction_id_video_predictions_id_fkey" FOREIGN KEY ("prediction_id") REFERENCES "video_predictions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "video_prediction_frames" ADD CONSTRAINT "video_prediction_frames_prediction_id_video_predictions_id_fkey" FOREIGN KEY ("prediction_id") REFERENCES "video_predictions"("id") ON DELETE CASCADE;
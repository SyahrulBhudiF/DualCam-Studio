CREATE TABLE "response_result_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"response_id" uuid NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"prediction_opt_in" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_response_result_access_response_id" ON "response_result_access" ("response_id");--> statement-breakpoint
ALTER TABLE "response_result_access" ADD CONSTRAINT "response_result_access_response_id_responses_id_fkey" FOREIGN KEY ("response_id") REFERENCES "responses"("id") ON DELETE CASCADE;
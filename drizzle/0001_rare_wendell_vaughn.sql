ALTER TABLE "answers" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_answers_question_id" ON "answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_class" ON "profiles" USING btree ("class");--> statement-breakpoint
CREATE INDEX "idx_questions_questionnaire_id" ON "questions" USING btree ("questionnaire_id");--> statement-breakpoint
CREATE INDEX "idx_response_details_response_id" ON "response_details" USING btree ("response_id");--> statement-breakpoint
CREATE INDEX "idx_response_details_question_id" ON "response_details" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_response_details_answer_id" ON "response_details" USING btree ("answer_id");--> statement-breakpoint
CREATE INDEX "idx_responses_user_id" ON "responses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_responses_questionnaire_id" ON "responses" USING btree ("questionnaire_id");--> statement-breakpoint
CREATE INDEX "idx_responses_created_at" ON "responses" USING btree ("created_at");
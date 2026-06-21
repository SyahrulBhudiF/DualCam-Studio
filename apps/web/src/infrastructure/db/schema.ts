import {
	boolean,
	doublePrecision,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import type { SpottingSignal } from "../schemas/prediction";

export const questionnaires = pgTable("questionnaires", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description"),
	isActive: boolean("is_active").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable(
	"questions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		questionnaireId: uuid("questionnaire_id")
			.references(() => questionnaires.id, { onDelete: "cascade" })
			.notNull(),
		questionText: text("question_text").notNull(),
		orderNumber: integer("order_number").default(0).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("idx_questions_questionnaire_id").on(table.questionnaireId),
	],
);

export const answers = pgTable(
	"answers",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		questionId: uuid("question_id")
			.references(() => questions.id, { onDelete: "cascade" })
			.notNull(),
		answerText: text("answer_text").notNull(),
		score: integer("score").default(0).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("idx_answers_question_id").on(table.questionId)],
);

export const profiles = pgTable(
	"profiles",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name"),
		email: text("email").unique(),
		nim: text("nim"),
		class: text("class"),
		semester: text("semester"),
		gender: text("gender"),
		age: integer("age"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("idx_profiles_class").on(table.class)],
);

export const responses = pgTable(
	"responses",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.references(() => profiles.id, { onDelete: "cascade" })
			.notNull(),
		questionnaireId: uuid("questionnaire_id")
			.references(() => questionnaires.id, { onDelete: "cascade" })
			.notNull(),
		videoPath: text("video_path"),
		totalScore: integer("total_score").default(0).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("idx_responses_user_id").on(table.userId),
		index("idx_responses_questionnaire_id").on(table.questionnaireId),
		index("idx_responses_created_at").on(table.createdAt),
	],
);

export const responseDetails = pgTable(
	"response_details",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		responseId: uuid("response_id")
			.references(() => responses.id, { onDelete: "cascade" })
			.notNull(),
		questionId: uuid("question_id")
			.references(() => questions.id, { onDelete: "cascade" })
			.notNull(),
		answerId: uuid("answer_id")
			.references(() => answers.id, { onDelete: "cascade" })
			.notNull(),
		score: integer("score").default(0).notNull(),
		videoSegmentPath: jsonb("video_segment_path"),
	},
	(table) => [
		index("idx_response_details_response_id").on(table.responseId),
		index("idx_response_details_question_id").on(table.questionId),
		index("idx_response_details_answer_id").on(table.answerId),
	],
);

export const responseResultAccess = pgTable(
	"response_result_access",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		responseId: uuid("response_id")
			.references(() => responses.id, { onDelete: "cascade" })
			.notNull(),
		tokenHash: text("token_hash").notNull().unique(),
		predictionOptIn: boolean("prediction_opt_in").default(false).notNull(),
		expiresAt: timestamp("expires_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("idx_response_result_access_response_id").on(table.responseId),
	],
);

export const videoPredictions = pgTable(
	"video_predictions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		videoPath: text("video_path").notNull(),
		playbackVideoPath: text("playback_video_path"),
		videoFormat: text("video_format"),
		videoMimeType: text("video_mime_type"),
		videoSizeBytes: integer("video_size_bytes"),
		accessTokenHash: text("access_token_hash").notNull(),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		status: text("status").default("pending").notNull(),
		label: text("label"),
		probabilityAnxietyTinggi: doublePrecision("probability_anxiety_tinggi"),
		threshold: doublePrecision("threshold"),
		aggregation: text("aggregation"),
		modelExpName: text("model_exp_name"),
		modelVersion: text("model_version"),
		frameCount: integer("frame_count"),
		durationSeconds: doublePrecision("duration_seconds"),
		fps: doublePrecision("fps"),
		eventCount: integer("event_count"),
		spottingSignal: jsonb("spotting_signal").$type<SpottingSignal | null>(),
		errorMessage: text("error_message"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("idx_video_predictions_status").on(table.status),
		index("idx_video_predictions_created_at").on(table.createdAt),
	],
);

export const videoPredictionEvents = pgTable(
	"video_prediction_events",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		predictionId: uuid("prediction_id")
			.references(() => videoPredictions.id, { onDelete: "cascade" })
			.notNull(),
		eventNo: integer("event_no").notNull(),
		onsetFrame: integer("onset_frame").notNull(),
		apexFrame: integer("apex_frame").notNull(),
		offsetFrame: integer("offset_frame").notNull(),
		onsetTimeSeconds: doublePrecision("onset_time_seconds"),
		apexTimeSeconds: doublePrecision("apex_time_seconds"),
		offsetTimeSeconds: doublePrecision("offset_time_seconds"),
		durationFrames: integer("duration_frames").notNull(),
		durationSeconds: doublePrecision("duration_seconds"),
		probabilityAnxietyTinggi: doublePrecision(
			"probability_anxiety_tinggi",
		).notNull(),
		label: text("label").notNull(),
	},
	(table) => [
		index("idx_video_prediction_events_prediction_id").on(table.predictionId),
	],
);

export const predictionResults = pgTable(
	"prediction_results",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		responseId: uuid("response_id")
			.references(() => responses.id, { onDelete: "cascade" })
			.notNull(),
		responseDetailId: uuid("response_detail_id").references(
			() => responseDetails.id,
			{ onDelete: "cascade" },
		),
		questionId: text("question_id").notNull(),
		videoKind: text("video_kind").notNull(),
		videoPath: text("video_path").notNull(),
		videoFormat: text("video_format"),
		videoMimeType: text("video_mime_type"),
		modelExpName: text("model_exp_name"),
		modelSeed: integer("model_seed"),
		modelVersion: text("model_version"),
		label: text("label"),
		probabilityAnxietyTinggi: doublePrecision("probability_anxiety_tinggi"),
		threshold: doublePrecision("threshold"),
		aggregation: text("aggregation"),
		frameCount: integer("frame_count"),
		durationSeconds: doublePrecision("duration_seconds"),
		status: text("status").default("pending").notNull(),
		errorMessage: text("error_message"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("idx_prediction_results_response_id").on(table.responseId),
		index("idx_prediction_results_response_detail_id").on(
			table.responseDetailId,
		),
		index("idx_prediction_results_status").on(table.status),
	],
);

export const sessions = pgTable("sessions", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rateLimits = pgTable("rate_limits", {
	key: text("key").primaryKey(),
	count: integer("count").notNull().default(1),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

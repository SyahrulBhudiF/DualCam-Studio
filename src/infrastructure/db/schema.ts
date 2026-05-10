import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

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

import { relations } from "drizzle-orm";
import {
	answers,
	profiles,
	questionnaires,
	questions,
	responseDetails,
	responses,
	sessions,
	users,
} from "./schema";

export const questionnairesRelations = relations(
	questionnaires,
	({ many }) => ({
		questions: many(questions),
		responses: many(responses),
	}),
);

export const questionsRelations = relations(questions, ({ one, many }) => ({
	questionnaire: one(questionnaires, {
		fields: [questions.questionnaireId],
		references: [questionnaires.id],
	}),
	answers: many(answers),
	responseDetails: many(responseDetails),
}));

export const answersRelations = relations(answers, ({ one, many }) => ({
	question: one(questions, {
		fields: [answers.questionId],
		references: [questions.id],
	}),
	responseDetails: many(responseDetails),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
	responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
	profile: one(profiles, {
		fields: [responses.userId],
		references: [profiles.id],
	}),
	questionnaire: one(questionnaires, {
		fields: [responses.questionnaireId],
		references: [questionnaires.id],
	}),
	details: many(responseDetails),
}));

export const responseDetailsRelations = relations(
	responseDetails,
	({ one }) => ({
		response: one(responses, {
			fields: [responseDetails.responseId],
			references: [responses.id],
		}),
		question: one(questions, {
			fields: [responseDetails.questionId],
			references: [questions.id],
		}),
		answer: one(answers, {
			fields: [responseDetails.answerId],
			references: [answers.id],
		}),
	}),
);

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

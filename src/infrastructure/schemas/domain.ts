import { Schema } from "effect";

// Branded Types for Entity IDs
export const QuestionnaireId = Schema.UUID.pipe(Schema.brand("@App/QuestionnaireId"));
export type QuestionnaireId = Schema.Schema.Type<typeof QuestionnaireId>;

export const QuestionId = Schema.UUID.pipe(Schema.brand("@App/QuestionId"));
export type QuestionId = Schema.Schema.Type<typeof QuestionId>;

export const AnswerId = Schema.UUID.pipe(Schema.brand("@App/AnswerId"));
export type AnswerId = Schema.Schema.Type<typeof AnswerId>;

export const ProfileId = Schema.UUID.pipe(Schema.brand("@App/ProfileId"));
export type ProfileId = Schema.Schema.Type<typeof ProfileId>;

export const ResponseId = Schema.UUID.pipe(Schema.brand("@App/ResponseId"));
export type ResponseId = Schema.Schema.Type<typeof ResponseId>;

export const UserId = Schema.UUID.pipe(Schema.brand("@App/UserId"));
export type UserId = Schema.Schema.Type<typeof UserId>;

export const SessionId = Schema.UUID.pipe(Schema.brand("@App/SessionId"));
export type SessionId = Schema.Schema.Type<typeof SessionId>;

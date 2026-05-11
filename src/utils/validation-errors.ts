import { z } from "zod";

export type NormalizedValidationError = {
	formErrors: string[];
	fieldErrors: Record<string, string[]>;
};

const FIELD_LABELS: Record<string, string> = {
	email: "Email",
	password: "Password",
	redirectUrl: "Redirect URL",
	name: "Name",
	nim: "NIM",
	class: "Class",
	semester: "Semester",
	age: "Age",
	gender: "Gender",
	title: "Title",
	description: "Description",
	questionText: "Question text",
	answerText: "Answer text",
	score: "Score",
	questionnaireId: "Questionnaire",
	questionId: "Question",
	answerId: "Answer",
};

function getFieldLabel(path: PropertyKey[]) {
	const key = String(path.at(-1) ?? "field");
	return FIELD_LABELS[key] ?? key.replaceAll(/[-_]/g, " ").replace(/^\w/, (char) => char.toUpperCase());
}

function isEmptyValueIssue(issue: z.core.$ZodIssue) {
	return issue.code === "invalid_type" || issue.message.toLowerCase().includes("required");
}

function formatIssue(issue: z.core.$ZodIssue) {
	const label = getFieldLabel(issue.path ?? []);

	if (isEmptyValueIssue(issue)) {
		return `${label} is required.`;
	}

	switch (issue.code) {
		case "invalid_format":
			return label === "Email" ? "Enter a valid email address." : `Enter a valid ${label.toLowerCase()}.`;
		case "too_small":
			if (label === "Password") {
				return "Password must be at least 8 characters.";
			}
			return issue.message.endsWith(".") ? issue.message : `${issue.message}.`;
		case "invalid_value":
			return `Choose a valid ${label.toLowerCase()}.`;
		default:
			return issue.message.endsWith(".") ? issue.message : `${issue.message}.`;
	}
}

function addFieldError(fieldErrors: Record<string, string[]>, path: PropertyKey[], message: string) {
	const key = String(path[0] ?? "form");
	fieldErrors[key] = [...(fieldErrors[key] ?? []), message];
}

export function normalizeZodError(error: z.ZodError): NormalizedValidationError {
	const fieldErrors: Record<string, string[]> = {};
	const formErrors: string[] = [];

	for (const issue of error.issues) {
		const message = formatIssue(issue);

		if (issue.path.length === 0) {
			formErrors.push(message);
			continue;
		}

		addFieldError(fieldErrors, issue.path, message);
	}

	return { formErrors, fieldErrors };
}

function parseErrorMessage(error: unknown) {
	if (!error || typeof error !== "object" || !("message" in error)) {
		return null;
	}

	const message = (error as { message?: unknown }).message;
	return typeof message === "string" ? message : null;
}

function zodErrorFromMessage(message: string) {
	try {
		const parsed: unknown = JSON.parse(message);

		if (Array.isArray(parsed)) {
			return new z.ZodError(parsed as z.core.$ZodIssue[]);
		}
	} catch (_: unknown) {
		return null;
	}

	return null;
}

export function getFormError(error: unknown): NormalizedValidationError | null {
	if (error instanceof z.ZodError) {
		return normalizeZodError(error);
	}

	const message = parseErrorMessage(error);
	if (!message) {
		return null;
	}

	const zodError = zodErrorFromMessage(message);
	if (zodError) {
		return normalizeZodError(zodError);
	}

	return {
		formErrors: [message],
		fieldErrors: {},
	};
}


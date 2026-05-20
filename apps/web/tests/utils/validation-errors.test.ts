import { describe, expect, it } from "vitest";
import { z } from "zod";
import { getFormError } from "../../src/utils/validation-errors";

const loginSchema = z.object({
	email: z.email("Enter a valid email address."),
	password: z.string().min(8, "Password must be at least 8 characters."),
});

describe("validation error formatting", () => {
	it("formats zod field errors for users", () => {
		const error = loginSchema.safeParse({
			email: "bad",
			password: "123",
		}).error;

		const normalized = getFormError(error);

		expect(normalized?.fieldErrors).toEqual({
			email: ["Enter a valid email address."],
			password: ["Password must be at least 8 characters."],
		});
	});

	it("formats serialized zod errors from server function validators", () => {
		const error = loginSchema.safeParse({
			email: "bad",
			password: "123",
		}).error;
		const serializedError = new Error(JSON.stringify(error?.issues));

		expect(getFormError(serializedError)?.fieldErrors.email?.[0]).toBe(
			"Enter a valid email address.",
		);
	});
});

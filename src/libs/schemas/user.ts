import { z } from "zod";

const passwordSchema = z.string().min(8, "Password must be at least 8 characters.");

export const loginSchema = z.object({
	email: z.email("Enter a valid email address."),
	password: passwordSchema,
});

export const signupSchema = z.object({
	email: z.email("Enter a valid email address."),
	password: passwordSchema,
	redirectUrl: z.string().optional(),
});

export const profileSchema = z.object({
	email: z.email("Enter a valid email address."),
	name: z.string().min(1, "Name is required"),
	nim: z.string().min(1, "NIM is required"),
	class: z.string().min(1, "Class is required"),
	semester: z.string().min(1, "Semester is required"),
	age: z.number().min(0, "Age must be a positive number"),
	gender: z.enum(["L", "P"], {
		message: "Gender is required",
	}),
});

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function requireEnv<T>(name: string): T {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value as T;
}

export function getValidationErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return null;
  }

  try {
    const parsed = JSON.parse(error.message as string);

    if (Array.isArray(parsed) && parsed[0] && parsed[0].message) {
      return parsed[0].message as string;
    }
  } catch (_: unknown) {
    return error.message as string;
  }

  return error.message as string;
}

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

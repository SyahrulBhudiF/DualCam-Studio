import { createServerClient } from "@supabase/ssr";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { s as setCookie, b as getCookies } from "../server.js";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
function getValidationErrorMessage(error) {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return null;
  }
  try {
    const parsed = JSON.parse(error.message);
    if (Array.isArray(parsed) && parsed[0] && parsed[0].message) {
      return parsed[0].message;
    }
  } catch (_) {
    return error.message;
  }
  return error.message;
}
function getPageNumbers(currentPage, totalPages) {
  const maxVisiblePages = 5;
  const rangeWithDots = [];
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i);
    }
  } else {
    rangeWithDots.push(1);
    if (currentPage <= 3) {
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i);
      }
      rangeWithDots.push("...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      rangeWithDots.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i);
      }
    } else {
      rangeWithDots.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i);
      }
      rangeWithDots.push("...", totalPages);
    }
  }
  return rangeWithDots;
}
function getSupabaseServerClient() {
  return createServerClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value
          }));
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            setCookie(cookie.name, cookie.value);
          });
        }
      }
    }
  );
}
export {
  getValidationErrorMessage as a,
  getPageNumbers as b,
  cn as c,
  getSupabaseServerClient as g
};

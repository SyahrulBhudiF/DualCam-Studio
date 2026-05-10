import { randomBytes } from "node:crypto";

export function generateToken(length = 48): string {
	return randomBytes(length).toString("base64url");
}

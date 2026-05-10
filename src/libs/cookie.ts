import Cookies from "js-cookie";

const DEFAULT_EXPIRES_DAYS = 7;

function hasDocument() {
	return typeof document !== "undefined";
}

export function getCookie(name: string): string | undefined {
	if (!hasDocument()) return undefined;
	return Cookies.get(name);
}

export function setCookie(
	name: string,
	value: string,
	days = DEFAULT_EXPIRES_DAYS,
): void {
	if (!hasDocument()) return;
	Cookies.set(name, value, { expires: days, path: "/" });
}

export function removeCookie(name: string): void {
	if (!hasDocument()) return;
	Cookies.remove(name, { path: "/" });
}

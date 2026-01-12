import { hc } from "hono/client";
import type { AppType } from "../lib/api";

const API_BASE = process.env.BLOG_API_URL ?? "http://localhost:3000";

export function createClient(token: string) {
	return hc<AppType>(API_BASE, {
		headers: { Authorization: `Bearer ${token}` },
	});
}

export { API_BASE };

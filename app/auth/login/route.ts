import { requireAuth } from "@/auth";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const nextUrl = url.searchParams.get("next");
	await requireAuth(nextUrl ?? "/");
}

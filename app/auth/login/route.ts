import type { NextRequest } from "next/server";
import { requireAuth } from "@/auth";

export async function GET(request: NextRequest) {
	const nextUrl = request.nextUrl.searchParams.get("next");
	await requireAuth(nextUrl || "/");
}

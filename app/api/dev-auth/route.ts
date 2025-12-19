import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { env } from "@/env";

export async function GET(request: NextRequest) {
	// Only allow in development
	if (env.NODE_ENV !== "development") {
		return NextResponse.json({ error: "Not available in production" }, { status: 403 });
	}

	// Set the dev session
	const session = await getSession();
	session.githubUsername = "jokull";
	await session.save();

	// Redirect back to the original URL
	const nextUrl = request.nextUrl.searchParams.get("next") ?? "/";
	return NextResponse.redirect(new URL(nextUrl, request.url));
}

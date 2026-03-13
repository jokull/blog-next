import { getSession } from "@/auth";
import { env } from "@/env";

export async function GET(request: Request) {
	// Only allow in development
	if (env.NODE_ENV !== "development") {
		return Response.json({ error: "Not available in production" }, { status: 403 });
	}

	const url = new URL(request.url);

	// Set the dev session
	const session = await getSession();
	session.githubUsername = "jokull";
	await session.save();

	// Redirect back to the original URL
	const nextUrl = url.searchParams.get("next") ?? "/";
	return Response.redirect(new URL(nextUrl, request.url).toString(), 302);
}

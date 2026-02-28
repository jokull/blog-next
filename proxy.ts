import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { env } from "@/env";

export async function proxy(request: NextRequest) {
	const { pathname, searchParams } = request.nextUrl;

	// Protect admin routes
	if (pathname.includes("/(admin)") || pathname.includes("/editor")) {
		const session = await getIronSession<{
			githubUsername?: string;
		}>(await cookies(), {
			cookieName: "auth",
			password: env.GITHUB_CLIENT_SECRET,
			cookieOptions: {
				secure: env.NODE_ENV === "production",
				httpOnly: true,
				path: "/",
				maxAge: 60 * 60 * 24 * 365,
			},
		});

		// Check if user is authenticated and is admin
		if (!session.githubUsername || session.githubUsername !== "jokull") {
			const currentUrl = pathname + (searchParams.toString() ? `?${searchParams}` : "");

			// In development, redirect to dev auth
			if (env.NODE_ENV === "development") {
				const url = request.nextUrl.clone();
				url.pathname = "/api/dev-auth";
				url.searchParams.set("next", currentUrl);
				return NextResponse.redirect(url);
			}

			// In production, redirect to GitHub OAuth
			const url = request.nextUrl.clone();
			url.pathname = "/auth/login";
			url.searchParams.set("next", currentUrl);
			return NextResponse.redirect(url);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};

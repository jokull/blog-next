import { generateState } from "arctic";
import { sealData } from "iron-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getOauthClient, getSession, whoami } from "@/auth";
import { env } from "@/env";

// Create a CLI auth token that can be verified by the API
async function createCliToken(username: string): Promise<string> {
	return await sealData(
		{ githubUsername: username, type: "cli" },
		{ password: env.GITHUB_CLIENT_SECRET, ttl: 60 * 60 * 24 * 365 }, // 1 year
	);
}

export async function GET(request: NextRequest) {
	const callback = request.nextUrl.searchParams.get("callback");
	const code = request.nextUrl.searchParams.get("code");

	if (!callback) {
		return NextResponse.json({ error: "Missing callback URL" }, { status: 400 });
	}

	// In development, skip OAuth and create token directly
	if (env.NODE_ENV === "development" && !code) {
		const token = await createCliToken("jokull");
		const redirectUrl = new URL(callback);
		redirectUrl.searchParams.set("cookie", token);
		return NextResponse.redirect(redirectUrl);
	}

	// If we have a code, this is the OAuth callback
	if (code) {
		const storedCallback = request.cookies.get("cli_callback")?.value;
		if (!storedCallback) {
			return NextResponse.json({ error: "Missing stored callback" }, { status: 400 });
		}

		try {
			const github = getOauthClient(
				`https://${request.nextUrl.host}/api/cli-auth?callback=${encodeURIComponent(storedCallback)}`,
			);
			const tokens = await github.validateAuthorizationCode(code);
			const accessToken = tokens.accessToken();
			const user = await whoami(accessToken);

			// Only allow admin user
			if (user.login !== "jokull") {
				return NextResponse.json({ error: "Unauthorized user" }, { status: 403 });
			}

			// Set the regular session too (for consistency)
			const session = await getSession();
			session.githubUsername = user.login;
			await session.save();

			// Create CLI token and redirect to CLI
			const token = await createCliToken(user.login);
			const redirectUrl = new URL(storedCallback);
			redirectUrl.searchParams.set("cookie", token);

			const response = NextResponse.redirect(redirectUrl);
			response.cookies.delete("cli_callback");
			response.cookies.delete("cli_state");
			return response;
		} catch (error) {
			return NextResponse.json({ error: String(error) }, { status: 500 });
		}
	}

	// Start OAuth flow
	const oauthState = generateState();
	const redirectUri = `https://${request.nextUrl.host}/api/cli-auth?callback=${encodeURIComponent(callback)}`;
	const github = getOauthClient(redirectUri);
	const authorizationURL = github.createAuthorizationURL(oauthState, ["user:email"]);

	const response = NextResponse.redirect(authorizationURL);
	// Store callback and state in cookies for when OAuth returns
	response.cookies.set("cli_callback", callback, { httpOnly: true, maxAge: 600 });
	response.cookies.set("cli_state", oauthState, { httpOnly: true, maxAge: 600 });
	return response;
}

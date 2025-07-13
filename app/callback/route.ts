import { type NextRequest, NextResponse } from "next/server";
import { getOauthClient, getSession, whoami } from "@/auth";

export async function GET(request: NextRequest) {
	const github = getOauthClient(`https://${request.nextUrl.host}/callback`);

	// Extract the authorization code and next URL from query parameters
	const code = request.nextUrl.searchParams.get("code");
	const nextUrl = request.nextUrl.searchParams.get("next");

	if (!code) {
		return NextResponse.json("missing_code");
	}

	try {
		// Validate the authorization code and get tokens
		const tokens = await github.validateAuthorizationCode(code);
		const accessToken = tokens.accessToken();

		const user = await whoami(accessToken);

		// Allow any GitHub user to authenticate

		// Set a cookie for authentication
		const session = await getSession();
		session.githubUsername = user.login;
		await session.save();

		// Redirect to the original page or home
		const redirectUrl = nextUrl ? decodeURIComponent(nextUrl) : "/";
		return NextResponse.redirect(new URL(redirectUrl, request.url));
	} catch (error) {
		return NextResponse.json(error);
	}
}

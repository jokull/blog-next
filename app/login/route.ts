import { generateState } from "arctic";
import { type NextRequest, NextResponse } from "next/server";
import { getOauthClient } from "@/auth";

export async function GET(request: NextRequest) {
	const github = getOauthClient(`https://${request.nextUrl.host}/callback`);

	// Generate state and authorization URL
	const state = generateState();
	const scopes = ["user:email"];
	const authorizationURL = github.createAuthorizationURL(state, scopes);

	// Redirect the user to GitHub's authorization URL
	return NextResponse.redirect(authorizationURL);
}

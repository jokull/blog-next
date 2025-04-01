import { getOauthClient } from "@/auth";
import { generateState } from "arctic";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const github = getOauthClient(`https://${request.nextUrl.host}/callback`);

  // Generate state and authorization URL
  const state = generateState();
  const scopes = ["user:email"];
  const authorizationURL = github.createAuthorizationURL(state, scopes);

  // Redirect the user to GitHub's authorization URL
  return NextResponse.redirect(authorizationURL);
}

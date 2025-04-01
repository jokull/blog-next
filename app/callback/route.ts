import { getOauthClient, getSession, whoami } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const github = getOauthClient(`https://${request.nextUrl.host}/callback`);

  // Extract the authorization code from the query parameters
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json("missing_code");
  }

  try {
    // Validate the authorization code and get tokens
    const tokens = await github.validateAuthorizationCode(code);
    const accessToken = tokens.accessToken();

    const email = await whoami(accessToken);

    // Check if the email matches the allowed email
    if (email !== "jokull@solberg.is") {
      return NextResponse.json("unauthorized");
    }
    // Set a cookie for authentication
    const session = await getSession();
    session.email = email;
    await session.save();

    return NextResponse.json("ok");
  } catch (error) {
    return NextResponse.json(error);
  }
}

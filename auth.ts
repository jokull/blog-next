import { env } from "@/env";
import { GitHub } from "arctic";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export function getOauthClient(redirectUri: string = "") {
  return new GitHub(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
    redirectUri
  );
}

export async function whoami(accessToken: string) {
  // Fetch the authenticated user's information using GitHub API
  const user = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  }).then((res) => res.json() as Promise<{ email: string }>);
  return user.email;
}

export async function requireAuth() {
  const session = await getSession();
  if (session.email !== "jokull@solberg.is") {
    forbidden();
  }
  return session.email;
}

export async function getSession() {
  return await getIronSession<{
    email?: string;
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
}

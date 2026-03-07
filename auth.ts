import { GitHub, generateState } from "arctic";
import { getIronSession } from "iron-session";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env";
import { fetchAuthenticatedUser, fetchGithubUser } from "@/lib/github";

export function getOauthClient(redirectUri: string = "") {
	return new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, redirectUri);
}

export { fetchAuthenticatedUser as whoami, fetchGithubUser as getGithubUser };

export async function requireAuth(currentUrl?: string) {
	const session = await getSession();
	if (!session.githubUsername) {
		// In development, redirect to dev auth route handler
		if (env.NODE_ENV === "development") {
			redirect(`/api/dev-auth?next=${encodeURIComponent(currentUrl ?? "/")}`);
		}

		const headersList = await headers();
		const host = headersList.get("host");
		const callbackUrl = `https://${host}/callback?next=${encodeURIComponent(currentUrl ?? "/")}`;
		const github = getOauthClient(callbackUrl);

		const state = generateState();
		const scopes = ["user:email"];
		const authorizationURL = github.createAuthorizationURL(state, scopes);

		redirect(authorizationURL.toString());
	}
	return session.githubUsername;
}

export async function isAdmin() {
	const session = await getSession();
	return session.githubUsername === "jokull";
}

export async function requireAdmin(currentUrl?: string) {
	const username = await requireAuth(currentUrl);
	if (username !== "jokull") {
		throw new Error("Admin access required");
	}
	return username;
}

export async function getSession() {
	return getIronSession<{
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
}

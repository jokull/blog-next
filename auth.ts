import { GitHub, generateState } from "arctic";
import { getIronSession } from "iron-session";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env";

export function getOauthClient(redirectUri: string = "") {
	return new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, redirectUri);
}

export async function whoami(accessToken: string) {
	// Fetch the authenticated user's information using GitHub API
	const user = await fetch("https://api.github.com/user", {
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${accessToken}`,
			"X-GitHub-Api-Version": "2022-11-28",
		},
	}).then(
		(res) =>
			res.json() as Promise<{
				email: string;
				id: number;
				login: string;
				name: string | null;
				avatar_url: string;
			}>,
	);
	return user;
}

export async function getGithubUser(username: string) {
	// Fetch public GitHub user info
	const user = await fetch(`https://api.github.com/users/${username}`, {
		headers: {
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	}).then(
		(res) =>
			res.json() as Promise<{
				id: number;
				login: string;
				name: string | null;
				avatar_url: string;
			}>,
	);
	return user;
}

export async function requireAuth(currentUrl?: string) {
	const session = await getSession();
	if (!session.githubUsername) {
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
	return await getIronSession<{
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

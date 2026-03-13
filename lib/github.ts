import { z } from "zod";
import { safeFetchJson, safeZodParse } from "./safe-utils";

export const githubUserSchema = z.object({
	email: z.string().nullable(),
	id: z.number(),
	login: z.string(),
	name: z.string().nullable(),
	avatar_url: z.string(),
});

export type GitHubUser = z.infer<typeof githubUserSchema>;

const GITHUB_HEADERS = {
	Accept: "application/vnd.github+json",
	"X-GitHub-Api-Version": "2022-11-28",
} as const;

export async function fetchAuthenticatedUser(accessToken: string): Promise<GitHubUser> {
	const result = await safeFetchJson("https://api.github.com/user", {
		headers: {
			...GITHUB_HEADERS,
			Authorization: `Bearer ${accessToken}`,
			"User-Agent": "solberg-blog",
		},
	});
	return result.andThen(safeZodParse(githubUserSchema)).unwrap("GitHub API error");
}

export async function fetchGithubUser(username: string): Promise<GitHubUser> {
	const result = await safeFetchJson(`https://api.github.com/users/${username}`, {
		headers: { ...GITHUB_HEADERS, "User-Agent": "solberg-blog" },
		signal: AbortSignal.timeout(3000),
	});
	return result.andThen(safeZodParse(githubUserSchema)).unwrap("GitHub user fetch error");
}

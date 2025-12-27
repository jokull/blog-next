import { getSession, isAdmin } from "@/auth";
import { getPublishedThemes, getUserThemes } from "./actions";
import { KittyClient } from "./_components/kitty-client";
import { defaultTheme } from "./_lib/default-theme";
import { fetchThemeConfig, fetchThemesList, parseThemeConfig } from "./_lib/theme-parser";
import type { KittyTheme } from "./_lib/types";

export const dynamic = "force-dynamic";

type InitialTab = "community" | "published" | "my-themes";

export default async function KittyPage({
	searchParams,
}: {
	searchParams: Promise<{ theme?: string }>;
}) {
	const { theme: themeParam } = await searchParams;
	const session = await getSession();
	const isAdminUser = await isAdmin();

	const publishedThemes = await getPublishedThemes();
	const userThemes = session.githubUsername ? await getUserThemes() : [];

	// Resolve initial theme from URL - server handles all async work
	let initialTheme: KittyTheme = defaultTheme;
	let initialTab: InitialTab = session.githubUsername ? "my-themes" : "published";

	if (themeParam) {
		if (themeParam.startsWith("community:")) {
			// Community theme - fetch from GitHub
			const communityFile = themeParam.slice("community:".length);
			try {
				const themes = await fetchThemesList();
				const meta = themes.find((t) => t.file === communityFile);
				if (meta) {
					const configText = await fetchThemeConfig(meta.file);
					const parsed = parseThemeConfig(configText);
					initialTheme = {
						id: null,
						slug: "",
						name: parsed.name ?? meta.name,
						blurb: parsed.blurb ?? meta.blurb ?? null,
						authorGithubId: 0,
						authorGithubUsername: meta.author ?? "",
						authorAvatarUrl: "",
						isPublished: false,
						forkedFromId: null,
						createdAt: new Date(),
						modifiedAt: null,
						colors: {
							...defaultTheme.colors,
							...parsed.colors,
						},
					};
					initialTab = "community";
				}
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error("Failed to load community theme:", error);
			}
		} else {
			// DB theme - look up by ID
			const themeId = parseInt(themeParam, 10);
			if (!isNaN(themeId)) {
				const published = publishedThemes.find((t) => t.id === themeId);
				if (published) {
					initialTheme = published;
					initialTab = "published";
				} else {
					const userTheme = userThemes.find((t) => t.id === themeId);
					if (userTheme) {
						initialTheme = userTheme;
						initialTab = "my-themes";
					}
				}
			}
		}
	}

	return (
		<KittyClient
			publishedThemes={publishedThemes}
			userThemes={userThemes}
			username={session.githubUsername}
			isAdmin={isAdminUser}
			initialTheme={initialTheme}
			initialTab={initialTab}
		/>
	);
}

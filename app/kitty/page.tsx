import { getSession, isAdmin } from "@/auth";
import { getPublishedThemes, getUserThemes } from "./actions";
import { KittyClient } from "./_components/kitty-client";

export const dynamic = "force-dynamic";

export default async function KittyPage() {
	const session = await getSession();
	const isAdminUser = await isAdmin();

	const publishedThemes = await getPublishedThemes();
	const userThemes = session.githubUsername ? await getUserThemes() : [];

	return (
		<KittyClient
			publishedThemes={publishedThemes}
			userThemes={userThemes}
			username={session.githubUsername}
			isAdmin={isAdminUser}
		/>
	);
}

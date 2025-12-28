import { getSession, isAdmin } from "@/auth";
import { KittyProvider } from "./_context/kitty-context";
import { ThemeSidebar } from "./_components/theme-sidebar";
import { getPublishedThemes, getUserThemes } from "./actions";

export default async function KittyLayout({ children }: { children: React.ReactNode }) {
	const session = await getSession();
	const isAdminUser = await isAdmin();
	const publishedThemes = await getPublishedThemes();
	const userThemes = session.githubUsername ? await getUserThemes() : [];

	return (
		<KittyProvider
			publishedThemes={publishedThemes}
			userThemes={userThemes}
			username={session.githubUsername}
			isAdmin={isAdminUser}
		>
			<div className="flex h-screen overflow-hidden bg-bg">
				<aside className="w-80 border-r border-border overflow-hidden flex flex-col bg-muted/5">
					<ThemeSidebar />
				</aside>
				<main className="flex-1 overflow-y-auto flex flex-col">{children}</main>
			</div>
		</KittyProvider>
	);
}

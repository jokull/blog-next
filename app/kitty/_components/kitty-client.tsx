"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { defaultTheme } from "../_lib/default-theme";
import type { ColorKey, KittyTheme, OklchColor } from "../_lib/types";
import {
	fetchThemeConfig,
	fetchThemesList,
	parseThemeConfig,
	type ThemeMetadata,
} from "../_lib/theme-parser";
import {
	createTheme,
	deleteTheme,
	forkTheme,
	getForkedFromTheme,
	togglePublish,
	updateTheme,
} from "../actions";
import { EditorToolbar, type EditorMode } from "./editor-toolbar";
import { ThemeEditor } from "./theme-editor";
import { ThemeSidebar, type SidebarTab } from "./theme-sidebar";

interface KittyClientProps {
	publishedThemes: KittyTheme[];
	userThemes: KittyTheme[];
	username?: string;
	isAdmin: boolean;
	initialTheme: KittyTheme;
	initialTab: SidebarTab;
}

export function KittyClient({
	publishedThemes,
	userThemes,
	username,
	isAdmin,
	initialTheme,
	initialTab,
}: KittyClientProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	// Helper to update URL with theme ID
	const setThemeParam = useCallback(
		(themeId: number | null, communityFile?: string) => {
			const params = new URLSearchParams(searchParams.toString());
			if (communityFile) {
				params.set("theme", `community:${communityFile}`);
			} else if (themeId) {
				params.set("theme", String(themeId));
			} else {
				params.delete("theme");
			}
			router.replace(`/kitty?${params.toString()}`, { scroll: false });
		},
		[router, searchParams],
	);

	// Mode state
	const [mode, setMode] = useState<EditorMode>("view");

	// Theme state - initialTheme comes from server (handles URL resolution)
	const [currentTheme, setCurrentTheme] = useState<KittyTheme>(initialTheme);
	const [savedTheme, setSavedTheme] = useState<KittyTheme>(initialTheme);
	const [selectedColor, setSelectedColor] = useState<ColorKey>("color1");
	const [forkedFrom, setForkedFrom] = useState<KittyTheme | null>(null);

	// Store previous theme for discard functionality
	const [previousTheme, setPreviousTheme] = useState<KittyTheme | null>(null);

	// Sidebar state
	const [communityThemes, setCommunityThemes] = useState<ThemeMetadata[] | null>(null);
	const [communityLoading, setCommunityLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<SidebarTab>(initialTab);

	// Derived state
	const isOwner = currentTheme.authorGithubUsername === username;
	const canEdit = isOwner || isAdmin;
	const hasUnsavedChanges =
		currentTheme.name !== savedTheme.name ||
		currentTheme.blurb !== savedTheme.blurb ||
		JSON.stringify(currentTheme.colors) !== JSON.stringify(savedTheme.colors);

	// Warn before leaving with unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges && (mode === "edit" || mode === "draft")) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [hasUnsavedChanges, mode]);

	// Load forked from theme info
	useEffect(() => {
		if (currentTheme.forkedFromId) {
			void getForkedFromTheme(currentTheme.forkedFromId).then((theme) => {
				if (theme) setForkedFrom(theme);
			});
		} else {
			setForkedFrom(null);
		}
	}, [currentTheme.forkedFromId]);

	// Save theme (defined here for keyboard shortcut useEffect below)
	const handleSave = useCallback(() => {
		if (!currentTheme.id) return;

		startTransition(async () => {
			const updated = await updateTheme(currentTheme.id!, {
				name: currentTheme.name,
				blurb: currentTheme.blurb,
				colors: currentTheme.colors,
			});
			setSavedTheme(updated);
			setCurrentTheme(updated);
			if (mode === "draft") {
				setMode("edit");
			}
			router.refresh();
		});
	}, [currentTheme.id, currentTheme.name, currentTheme.blurb, currentTheme.colors, mode, router]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				if ((mode === "edit" || mode === "draft") && hasUnsavedChanges && !isPending) {
					handleSave();
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [mode, hasUnsavedChanges, isPending, handleSave]);

	// === Handlers ===

	// Load community themes list
	const handleLoadCommunity = async () => {
		if (communityThemes !== null || communityLoading) return;
		setCommunityLoading(true);
		try {
			const themes = await fetchThemesList();
			setCommunityThemes(themes);
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("Failed to load community themes:", error);
		} finally {
			setCommunityLoading(false);
		}
	};

	// Select a theme from Published or My Themes
	const handleSelectTheme = (theme: KittyTheme) => {
		if (hasUnsavedChanges && (mode === "edit" || mode === "draft")) {
			if (!confirm("You have unsaved changes. Are you sure you want to switch themes?")) {
				return;
			}
		}
		setCurrentTheme(theme);
		setSavedTheme(theme);
		setMode("view");
		setPreviousTheme(null);
		setThemeParam(theme.id);
	};

	// Select a community theme (loads from GitHub)
	const handleSelectCommunityTheme = (meta: ThemeMetadata) => {
		if (hasUnsavedChanges && (mode === "edit" || mode === "draft")) {
			if (!confirm("You have unsaved changes. Are you sure you want to switch themes?")) {
				return;
			}
		}

		startTransition(async () => {
			try {
				const configText = await fetchThemeConfig(meta.file);
				const parsed = parseThemeConfig(configText);

				const theme: KittyTheme = {
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

				setCurrentTheme(theme);
				setSavedTheme(theme);
				setMode("view");
				setPreviousTheme(null);
				setThemeParam(null, meta.file);
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error("Failed to load community theme:", error);
				alert("Failed to load theme. Please try again.");
			}
		});
	};

	// Create new theme
	const handleCreateNew = () => {
		if (!username) {
			window.location.href = `/auth/login?next=/kitty`;
			return;
		}

		if (hasUnsavedChanges && (mode === "edit" || mode === "draft")) {
			if (
				!confirm("You have unsaved changes. Are you sure you want to create a new theme?")
			) {
				return;
			}
		}

		// Store current theme for discard
		setPreviousTheme(currentTheme);

		startTransition(async () => {
			const newTheme = await createTheme({
				name: "Untitled Theme",
				colors: defaultTheme.colors,
				blurb: "",
			});
			setCurrentTheme(newTheme);
			setSavedTheme(newTheme);
			setMode("draft");
			setActiveTab("my-themes");
			setThemeParam(newTheme.id);
			router.refresh();
		});
	};

	// Enter edit mode
	const handleEnterEdit = () => {
		if (!canEdit) return;
		setMode("edit");
	};

	// Cancel edit mode (discard changes)
	const handleCancelEdit = () => {
		setCurrentTheme(savedTheme);
		setMode("view");
	};

	// Discard draft (for new/forked themes)
	const handleDiscard = () => {
		if (previousTheme) {
			setCurrentTheme(previousTheme);
			setSavedTheme(previousTheme);
			setThemeParam(previousTheme.id);
			setPreviousTheme(null);
		} else {
			setCurrentTheme(defaultTheme);
			setSavedTheme(defaultTheme);
			setThemeParam(null);
		}
		setMode("view");
	};

	// Publish/unpublish
	const handlePublish = () => {
		if (!currentTheme.id) return;

		startTransition(async () => {
			const updated = await togglePublish(currentTheme.id!);
			setCurrentTheme(updated);
			setSavedTheme(updated);
			router.refresh();
		});
	};

	// Fork theme
	const handleFork = () => {
		if (!username) {
			window.location.href = `/auth/login?next=/kitty`;
			return;
		}

		// Store current theme for discard
		setPreviousTheme(currentTheme);

		startTransition(async () => {
			let newTheme: KittyTheme;
			// For community themes (id is null), create a new theme
			if (currentTheme.id === null) {
				newTheme = await createTheme({
					name: `${currentTheme.name} (Remix)`,
					colors: currentTheme.colors,
					blurb: currentTheme.blurb ?? "",
				});
			} else {
				// For existing themes, use the fork action
				newTheme = await forkTheme(currentTheme.id);
			}
			setCurrentTheme(newTheme);
			setSavedTheme(newTheme);
			setMode("draft");
			setActiveTab("my-themes");
			setThemeParam(newTheme.id);
			router.refresh();
		});
	};

	// Delete theme (confirmation handled inline in EditorToolbar)
	const handleDelete = () => {
		if (!currentTheme.id) return;

		startTransition(async () => {
			await deleteTheme(currentTheme.id!);
			setCurrentTheme(defaultTheme);
			setSavedTheme(defaultTheme);
			setMode("view");
			setThemeParam(null);
			router.refresh();
		});
	};

	// Color change
	const handleColorChange = (colorKey: ColorKey, newColor: OklchColor) => {
		setCurrentTheme((prev) => ({
			...prev,
			colors: { ...prev.colors, [colorKey]: newColor },
		}));
	};

	// Update name
	const handleUpdateName = (name: string) => {
		setCurrentTheme((prev) => ({ ...prev, name }));
	};

	// Update blurb
	const handleUpdateBlurb = (blurb: string) => {
		setCurrentTheme((prev) => ({ ...prev, blurb }));
	};

	return (
		<div className="flex h-screen overflow-hidden bg-bg">
			{/* Left sidebar */}
			<aside className="w-80 border-r border-border overflow-hidden flex flex-col bg-muted/5">
				<ThemeSidebar
					publishedThemes={publishedThemes}
					userThemes={userThemes}
					communityThemes={communityThemes}
					communityLoading={communityLoading}
					currentThemeId={currentTheme.id}
					activeTab={activeTab}
					onTabChange={setActiveTab}
					onSelectTheme={handleSelectTheme}
					onSelectCommunityTheme={handleSelectCommunityTheme}
					onCreateNew={handleCreateNew}
					onLoadCommunity={() => {
						void handleLoadCommunity();
					}}
					username={username}
				/>
			</aside>

			{/* Right editor area */}
			<main className="flex-1 overflow-y-auto flex flex-col">
				<EditorToolbar
					theme={currentTheme}
					mode={mode}
					isOwner={isOwner}
					hasUnsavedChanges={hasUnsavedChanges}
					isPending={isPending}
					onEnterEdit={handleEnterEdit}
					onCancelEdit={handleCancelEdit}
					onSave={handleSave}
					onDiscard={handleDiscard}
					onPublish={handlePublish}
					onFork={handleFork}
					onDelete={handleDelete}
				/>
				<ThemeEditor
					theme={currentTheme}
					mode={mode}
					forkedFrom={forkedFrom}
					selectedColor={selectedColor}
					onSelectColor={setSelectedColor}
					onColorChange={handleColorChange}
					onUpdateName={handleUpdateName}
					onUpdateBlurb={handleUpdateBlurb}
				/>
			</main>
		</div>
	);
}

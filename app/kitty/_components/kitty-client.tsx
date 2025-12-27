"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { defaultTheme } from "../_lib/default-theme";
import type { ColorKey, KittyTheme, OklchColor } from "../_lib/types";
import {
	createTheme,
	deleteTheme,
	forkTheme,
	getForkedFromTheme,
	togglePublish,
	updateTheme,
} from "../actions";
import { ColorEditor } from "./color-editor";
import { ColorSelector } from "./color-selector";
import { ExportButton } from "./export-button";
import { ImportDialog } from "./import-dialog";
import { ThemeBrowser } from "./theme-browser";
import { ThemeMetadata } from "./theme-metadata";
import { ThemePreview } from "./theme-preview";

interface KittyClientProps {
	publishedThemes: KittyTheme[];
	userThemes: KittyTheme[];
	username?: string;
	isAdmin: boolean;
}

export function KittyClient({
	publishedThemes: initialPublished,
	userThemes: initialUserThemes,
	username,
	isAdmin,
}: KittyClientProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	// State
	const [currentTheme, setCurrentTheme] = useState<KittyTheme>(defaultTheme);
	const [savedTheme, setSavedTheme] = useState<KittyTheme>(defaultTheme);
	const [selectedColor, setSelectedColor] = useState<ColorKey>("color1");
	const [showImport, setShowImport] = useState(false);
	const [forkedFrom, setForkedFrom] = useState<KittyTheme | null>(null);
	const allThemes = {
		published: initialPublished,
		user: initialUserThemes,
	};

	// Detect unsaved changes
	const hasUnsavedChanges =
		currentTheme.name !== savedTheme.name ||
		currentTheme.blurb !== savedTheme.blurb ||
		JSON.stringify(currentTheme.colors) !== JSON.stringify(savedTheme.colors);

	// Warn before leaving with unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [hasUnsavedChanges]);

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

	// Handlers
	const handleSelectTheme = (theme: KittyTheme) => {
		if (hasUnsavedChanges) {
			if (!confirm("You have unsaved changes. Are you sure you want to switch themes?")) {
				return;
			}
		}
		setCurrentTheme(theme);
		setSavedTheme(theme);
	};

	const handleCreateNew = () => {
		if (!username) {
			window.location.href = `/auth/login?next=/kitty`;
			return;
		}

		if (hasUnsavedChanges) {
			if (
				!confirm("You have unsaved changes. Are you sure you want to create a new theme?")
			) {
				return;
			}
		}

		startTransition(async () => {
			const newTheme = await createTheme({
				name: "Untitled Theme",
				colors: defaultTheme.colors,
				blurb: "",
			});
			setCurrentTheme(newTheme);
			setSavedTheme(newTheme);
			router.refresh();
		});
	};

	const handleSave = () => {
		if (!currentTheme.id) return;

		startTransition(async () => {
			const updated = await updateTheme(currentTheme.id!, {
				name: currentTheme.name,
				blurb: currentTheme.blurb,
				colors: currentTheme.colors,
			});
			setSavedTheme(updated);
			setCurrentTheme(updated);
			router.refresh();
		});
	};

	const handlePublish = () => {
		if (!currentTheme.id) return;

		startTransition(async () => {
			const updated = await togglePublish(currentTheme.id!);
			setCurrentTheme(updated);
			setSavedTheme(updated);
			router.refresh();
		});
	};

	const handleFork = () => {
		if (!username) {
			window.location.href = `/auth/login?next=/kitty`;
			return;
		}
		if (!currentTheme.id) return;

		if (hasUnsavedChanges) {
			if (!confirm("You have unsaved changes. Are you sure you want to fork this theme?")) {
				return;
			}
		}

		startTransition(async () => {
			const forked = await forkTheme(currentTheme.id!);
			setCurrentTheme(forked);
			setSavedTheme(forked);
			router.refresh();
		});
	};

	const handleDelete = () => {
		if (!currentTheme.id) return;
		if (!confirm("Are you sure you want to delete this theme? This cannot be undone.")) {
			return;
		}

		startTransition(async () => {
			await deleteTheme(currentTheme.id!);
			setCurrentTheme(defaultTheme);
			setSavedTheme(defaultTheme);
			router.refresh();
		});
	};

	const handleColorChange = (colorKey: ColorKey, newColor: OklchColor) => {
		setCurrentTheme((prev) => ({
			...prev,
			colors: { ...prev.colors, [colorKey]: newColor },
		}));
	};

	const handleUpdateName = (name: string) => {
		setCurrentTheme((prev) => ({ ...prev, name }));
	};

	const handleUpdateBlurb = (blurb: string) => {
		setCurrentTheme((prev) => ({ ...prev, blurb }));
	};

	const handleImport = (theme: KittyTheme) => {
		if (hasUnsavedChanges) {
			if (!confirm("You have unsaved changes. Are you sure you want to import a theme?")) {
				return;
			}
		}
		setCurrentTheme(theme);
		setSavedTheme(theme);
	};

	// Check ownership
	const isOwner = currentTheme.authorGithubUsername === username;
	const canEdit = isOwner || isAdmin;

	return (
		<div className="flex h-screen overflow-hidden bg-bg">
			{/* Left sidebar - Theme browser */}
			<aside className="w-80 border-r border-border overflow-y-auto bg-muted/5">
				<ThemeBrowser
					publishedThemes={allThemes.published}
					userThemes={allThemes.user}
					currentThemeId={currentTheme.id}
					onSelectTheme={handleSelectTheme}
					onCreateNew={handleCreateNew}
					username={username}
				/>
			</aside>

			{/* Right editor area */}
			<main className="flex-1 overflow-y-auto">
				<div className="p-6 space-y-6">
					{/* Header with actions */}
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold">Kitty Theme Builder</h1>
						<div className="flex gap-2">
							<Button
								intent="outline"
								size="sm"
								onPress={() => {
									setShowImport(true);
								}}
							>
								Import
							</Button>
							<ExportButton theme={currentTheme} />
						</div>
					</div>

					{/* Theme metadata */}
					<ThemeMetadata
						theme={currentTheme}
						canEdit={canEdit}
						isOwner={isOwner}
						forkedFrom={forkedFrom}
						onUpdateName={handleUpdateName}
						onUpdateBlurb={handleUpdateBlurb}
						onSave={handleSave}
						onPublish={handlePublish}
						onFork={handleFork}
						onDelete={handleDelete}
						hasUnsavedChanges={hasUnsavedChanges}
						isPending={isPending}
					/>

					{/* Color selector and editor */}
					<div>
						<div className="grid grid-cols-4 gap-6">
							{/* Color selector - 3 columns */}
							<div className="col-span-3">
								<ColorSelector
									theme={currentTheme}
									selectedColor={selectedColor}
									onSelectColor={setSelectedColor}
								/>
							</div>

							{/* Color editor - 1 column */}
							<div className="col-span-1">
								<ColorEditor
									color={currentTheme.colors[selectedColor]}
									onColorChange={(newColor) => {
										handleColorChange(selectedColor, newColor);
									}}
									disabled={!canEdit}
								/>
							</div>
						</div>
					</div>

					{/* Preview */}
					<ThemePreview theme={currentTheme} />
				</div>
			</main>

			{/* Import dialog */}
			<ImportDialog
				isOpen={showImport}
				onClose={() => {
					setShowImport(false);
				}}
				onImport={handleImport}
			/>
		</div>
	);
}

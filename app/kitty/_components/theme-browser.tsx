"use client";

import { useState, useMemo } from "react";
import type { ChangeEvent } from "react";
import type { KittyTheme } from "../_lib/types";
import { TextField } from "@/components/ui/text-field";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OctocatIcon } from "@/components/octocat-icon";

interface ThemeBrowserProps {
	publishedThemes: KittyTheme[];
	userThemes: KittyTheme[];
	currentThemeId?: number | null;
	onSelectTheme: (theme: KittyTheme) => void;
	onCreateNew: () => void;
	username?: string;
}

export function ThemeBrowser({
	publishedThemes,
	userThemes,
	currentThemeId,
	onSelectTheme,
	onCreateNew,
	username,
}: ThemeBrowserProps) {
	const [search, setSearch] = useState("");
	const [showMyThemes, setShowMyThemes] = useState(false);

	const filteredThemes = useMemo(() => {
		let themes = showMyThemes ? userThemes : publishedThemes;

		if (search) {
			const lower = search.toLowerCase();
			themes = themes.filter(
				(t) =>
					t.name.toLowerCase().includes(lower) ||
					t.authorGithubUsername?.toLowerCase().includes(lower),
			);
		}

		return themes;
	}, [publishedThemes, userThemes, search, showMyThemes]);

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 border-b border-border">
				<h1 className="text-lg font-bold mb-4">Themes</h1>

				<TextField className="mb-3">
					<Label className="sr-only">Search</Label>
					<Input
						placeholder="Search themes..."
						value={search}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setSearch(e.target.value);
						}}
					/>
				</TextField>

				{username && (
					<div className="flex gap-2 mb-3">
						<Button
							intent={!showMyThemes ? "primary" : "outline"}
							size="sm"
							onPress={() => {
								setShowMyThemes(false);
							}}
						>
							Published ({publishedThemes.length})
						</Button>
						<Button
							intent={showMyThemes ? "primary" : "outline"}
							size="sm"
							onPress={() => {
								setShowMyThemes(true);
							}}
						>
							My Themes ({userThemes.length})
						</Button>
					</div>
				)}

				{username ? (
					<Button intent="primary" onPress={onCreateNew} className="w-full">
						Create New Theme
					</Button>
				) : (
					<Button
						intent="secondary"
						onPress={onCreateNew}
						className="w-full bg-neutral-800 text-neutral-100 hover:bg-neutral-950 hover:text-white"
					>
						<OctocatIcon className="size-5" />
						Sign in with GitHub
					</Button>
				)}
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				<div className="text-xs text-muted-fg mb-2 uppercase tracking-wide font-semibold">
					{filteredThemes.length} {filteredThemes.length === 1 ? "theme" : "themes"}
				</div>

				<div className="space-y-2">
					{filteredThemes.map((theme) => (
						<button
							key={theme.id}
							type="button"
							onClick={() => {
								onSelectTheme(theme);
							}}
							className={`w-full text-left p-3 rounded-lg border transition-all ${
								currentThemeId === theme.id
									? "bg-primary/10 border-primary"
									: "border-border hover:bg-muted/10 hover:border-muted-fg/20"
							}`}
						>
							<div className="font-semibold text-sm mb-1">{theme.name}</div>
							{theme.authorGithubUsername && (
								<div className="text-xs text-muted-fg">
									by {theme.authorGithubUsername}
								</div>
							)}
							{theme.blurb && (
								<div className="text-xs text-muted-fg mt-1">{theme.blurb}</div>
							)}
							{!theme.isPublished && (
								<div className="text-xs text-warning mt-1 font-semibold">Draft</div>
							)}
						</button>
					))}
				</div>

				{filteredThemes.length === 0 && (
					<div className="text-center text-muted-fg py-8 text-sm">No themes found</div>
				)}
			</div>
		</div>
	);
}

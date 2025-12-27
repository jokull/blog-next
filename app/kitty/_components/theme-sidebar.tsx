"use client";

import { OctocatIcon } from "@/components/octocat-icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TextField } from "@/components/ui/text-field";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs";
import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import type { KittyTheme } from "../_lib/types";
import type { ThemeMetadata } from "../_lib/theme-parser";

export type SidebarTab = "community" | "published" | "my-themes";

interface ThemeSidebarProps {
	publishedThemes: KittyTheme[];
	userThemes: KittyTheme[];
	communityThemes: ThemeMetadata[] | null;
	communityLoading: boolean;
	currentThemeId: number | null;
	activeTab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
	onSelectTheme: (theme: KittyTheme) => void;
	onSelectCommunityTheme: (theme: ThemeMetadata) => void;
	onCreateNew: () => void;
	onLoadCommunity: () => void;
	username?: string;
}

export function ThemeSidebar({
	publishedThemes,
	userThemes,
	communityThemes,
	communityLoading,
	currentThemeId,
	activeTab,
	onTabChange,
	onSelectTheme,
	onSelectCommunityTheme,
	onCreateNew,
	onLoadCommunity,
	username,
}: ThemeSidebarProps) {
	const [search, setSearch] = useState("");

	// Filter themes based on search
	const filteredPublished = useMemo(() => {
		if (!search) return publishedThemes;
		const lower = search.toLowerCase();
		return publishedThemes.filter(
			(t) =>
				t.name.toLowerCase().includes(lower) ||
				t.authorGithubUsername?.toLowerCase().includes(lower),
		);
	}, [publishedThemes, search]);

	const filteredUserThemes = useMemo(() => {
		if (!search) return userThemes;
		const lower = search.toLowerCase();
		return userThemes.filter(
			(t) =>
				t.name.toLowerCase().includes(lower) ||
				t.authorGithubUsername?.toLowerCase().includes(lower),
		);
	}, [userThemes, search]);

	const filteredCommunity = useMemo(() => {
		if (!communityThemes) return [];
		if (!search) return communityThemes;
		const lower = search.toLowerCase();
		return communityThemes.filter(
			(t) => t.name.toLowerCase().includes(lower) || t.author?.toLowerCase().includes(lower),
		);
	}, [communityThemes, search]);

	// Handle tab change - trigger lazy load for community
	const handleTabChange = (key: React.Key) => {
		const tab = key as SidebarTab;
		onTabChange(tab);
		if (tab === "community" && communityThemes === null && !communityLoading) {
			onLoadCommunity();
		}
	};

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 border-b border-border">
				<h1 className="text-lg font-bold mb-4">Kitty Theme Builder</h1>

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
			</div>

			<Tabs
				selectedKey={activeTab}
				onSelectionChange={handleTabChange}
				className="flex-1 flex flex-col overflow-hidden"
			>
				<TabList aria-label="Theme categories" className="px-4">
					<Tab id="community">Community</Tab>
					<Tab id="published">Published</Tab>
					{username && <Tab id="my-themes">My Themes</Tab>}
				</TabList>

				<TabPanel id="community" className="flex-1 overflow-y-auto p-4">
					{communityLoading && (
						<div className="text-center py-8 text-muted-fg text-sm">
							Loading themes...
						</div>
					)}
					{!communityLoading && communityThemes === null && (
						<div className="text-center py-8 text-muted-fg text-sm">
							Click to load community themes
						</div>
					)}
					{!communityLoading && communityThemes && (
						<>
							<div className="text-xs text-muted-fg mb-2 uppercase tracking-wide font-semibold">
								{filteredCommunity.length}{" "}
								{filteredCommunity.length === 1 ? "theme" : "themes"}
							</div>
							<div className="space-y-2">
								{filteredCommunity.map((theme) => (
									<button
										key={theme.file}
										type="button"
										onClick={() => {
											onSelectCommunityTheme(theme);
										}}
										className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/10 hover:border-muted-fg/20 transition-all"
									>
										<div className="font-semibold text-sm mb-1">
											{theme.name}
										</div>
										{theme.author && (
											<div className="text-xs text-muted-fg">
												by {theme.author}
											</div>
										)}
										{theme.blurb && (
											<div className="text-xs text-muted-fg mt-1 line-clamp-2">
												{theme.blurb}
											</div>
										)}
										{theme.is_dark !== undefined && (
											<div className="text-xs text-muted-fg mt-1">
												{theme.is_dark ? "Dark" : "Light"}
											</div>
										)}
									</button>
								))}
								{filteredCommunity.length === 0 && (
									<div className="text-center text-muted-fg py-8 text-sm">
										No themes found
									</div>
								)}
							</div>
						</>
					)}
				</TabPanel>

				<TabPanel id="published" className="flex-1 overflow-y-auto p-4">
					<div className="text-xs text-muted-fg mb-2 uppercase tracking-wide font-semibold">
						{filteredPublished.length}{" "}
						{filteredPublished.length === 1 ? "theme" : "themes"}
					</div>
					<div className="space-y-2">
						{filteredPublished.map((theme) => (
							<ThemeCard
								key={theme.id}
								theme={theme}
								isSelected={currentThemeId === theme.id}
								onClick={() => {
									onSelectTheme(theme);
								}}
							/>
						))}
						{filteredPublished.length === 0 && (
							<div className="text-center text-muted-fg py-8 text-sm">
								No themes found
							</div>
						)}
					</div>
				</TabPanel>

				{username && (
					<TabPanel id="my-themes" className="flex-1 overflow-y-auto p-4">
						<div className="text-xs text-muted-fg mb-2 uppercase tracking-wide font-semibold">
							{filteredUserThemes.length}{" "}
							{filteredUserThemes.length === 1 ? "theme" : "themes"}
						</div>
						<div className="space-y-2">
							{filteredUserThemes.map((theme) => (
								<ThemeCard
									key={theme.id}
									theme={theme}
									isSelected={currentThemeId === theme.id}
									onClick={() => {
										onSelectTheme(theme);
									}}
								/>
							))}
							{filteredUserThemes.length === 0 && (
								<div className="text-center text-muted-fg py-8 text-sm">
									No themes yet. Create one!
								</div>
							)}
						</div>
					</TabPanel>
				)}
			</Tabs>

			<div className="p-4 border-t border-border">
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
		</div>
	);
}

interface ThemeCardProps {
	theme: KittyTheme;
	isSelected: boolean;
	onClick: () => void;
}

function ThemeCard({ theme, isSelected, onClick }: ThemeCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full text-left p-3 rounded-lg border transition-all ${
				isSelected
					? "bg-primary/10 border-primary"
					: "border-border hover:bg-muted/10 hover:border-muted-fg/20"
			}`}
		>
			<div className="font-semibold text-sm mb-1">{theme.name}</div>
			{theme.authorGithubUsername && (
				<div className="text-xs text-muted-fg">by {theme.authorGithubUsername}</div>
			)}
			{theme.blurb && (
				<div className="text-xs text-muted-fg mt-1 line-clamp-2">{theme.blurb}</div>
			)}
			{!theme.isPublished && (
				<div className="text-xs text-warning mt-1 font-semibold">Draft</div>
			)}
		</button>
	);
}

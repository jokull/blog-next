"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { ModalContent } from "@/components/ui/modal";
import { DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/text-field";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { defaultTheme } from "../_lib/default-theme";
import type { KittyTheme } from "../_lib/types";
import {
	fetchThemesList,
	fetchThemeConfig,
	parseThemeConfig,
	type ThemeMetadata,
} from "../_lib/theme-parser";

interface ImportDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (theme: KittyTheme) => void;
}

export function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
	const [themes, setThemes] = useState<ThemeMetadata[]>([]);
	const [filteredThemes, setFilteredThemes] = useState<ThemeMetadata[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [importing, setImporting] = useState(false);

	useEffect(() => {
		if (isOpen) {
			void fetchThemesList()
				.then((data) => {
					setThemes(data);
					setFilteredThemes(data);
				})
				.catch((err: unknown) => {
					// eslint-disable-next-line no-console
					console.error("Failed to fetch themes:", err);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [isOpen]);

	useEffect(() => {
		if (search) {
			const lower = search.toLowerCase();
			setFilteredThemes(
				themes.filter(
					(t) =>
						t.name.toLowerCase().includes(lower) ||
						t.author?.toLowerCase().includes(lower),
				),
			);
		} else {
			setFilteredThemes(themes);
		}
	}, [search, themes]);

	const handleImport = async (themeMetadata: ThemeMetadata) => {
		setImporting(true);
		try {
			const configText = await fetchThemeConfig(themeMetadata.file);
			const parsed = parseThemeConfig(configText);

			// Merge with default theme to ensure all colors exist
			const importedTheme: KittyTheme = {
				id: null,
				slug: "",
				name: parsed.name ?? themeMetadata.name,
				blurb: parsed.blurb ?? null,
				authorGithubId: 0,
				authorGithubUsername: "",
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

			onImport(importedTheme);
			onClose();
		} catch (err: unknown) {
			// eslint-disable-next-line no-console
			console.error("Failed to import theme:", err);
			alert("Failed to import theme. Please try again.");
		} finally {
			setImporting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<ModalContent
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
			isDismissable={!importing}
			size="2xl"
		>
			<DialogHeader>
				<DialogTitle>Import from Kitty Themes</DialogTitle>
			</DialogHeader>

			<DialogBody>
				<TextField className="mb-4">
					<Label>Search themes</Label>
					<Input
						placeholder="Search by name or author..."
						value={search}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setSearch(e.target.value);
						}}
					/>
				</TextField>

				{loading && <div className="text-center py-8 text-muted-fg">Loading themes...</div>}

				{!loading && (
					<div className="max-h-[400px] overflow-y-auto space-y-2">
						{filteredThemes.map((theme) => (
							<button
								key={theme.file}
								type="button"
								onClick={() => {
									void handleImport(theme);
								}}
								disabled={importing}
								className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/10 hover:border-muted-fg/20 transition-all disabled:opacity-50"
							>
								<div className="font-semibold text-sm mb-1">{theme.name}</div>
								{theme.author && (
									<div className="text-xs text-muted-fg">by {theme.author}</div>
								)}
								{theme.blurb && (
									<div className="text-xs text-muted-fg mt-1">{theme.blurb}</div>
								)}
								{theme.is_dark !== undefined && (
									<div className="text-xs text-muted-fg mt-1">
										{theme.is_dark ? "Dark" : "Light"}
									</div>
								)}
							</button>
						))}

						{filteredThemes.length === 0 && (
							<div className="text-center py-8 text-muted-fg text-sm">
								No themes found
							</div>
						)}
					</div>
				)}
			</DialogBody>

			<DialogFooter>
				<Button intent="outline" onPress={onClose} isDisabled={importing}>
					Cancel
				</Button>
			</DialogFooter>
		</ModalContent>
	);
}

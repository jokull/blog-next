"use client";

import type { ChangeEvent } from "react";
import type { KittyTheme } from "../_lib/types";
import { TextField } from "@/components/ui/text-field";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ThemeMetadataProps {
	theme: KittyTheme;
	canEdit: boolean;
	isOwner: boolean;
	forkedFrom?: KittyTheme | null;
	onUpdateName: (name: string) => void;
	onUpdateBlurb: (blurb: string) => void;
	onSave: () => void;
	onPublish: () => void;
	onFork: () => void;
	onDelete?: () => void;
	hasUnsavedChanges: boolean;
	isPending: boolean;
}

export function ThemeMetadata({
	theme,
	canEdit,
	isOwner,
	forkedFrom,
	onUpdateName,
	onUpdateBlurb,
	onSave,
	onPublish,
	onFork,
	onDelete,
	hasUnsavedChanges,
	isPending,
}: ThemeMetadataProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					{theme.authorGithubUsername && (
						<div className="text-sm text-muted-fg mb-1">
							by {theme.authorGithubUsername}
							{theme.isPublished ? (
								<span className="ml-2 text-success font-semibold">Published</span>
							) : (
								<span className="ml-2 text-warning font-semibold">Draft</span>
							)}
						</div>
					)}
					{forkedFrom && (
						<div className="text-xs text-muted-fg">
							Forked from{" "}
							<span className="font-semibold">
								{forkedFrom.name} by {forkedFrom.authorGithubUsername}
							</span>
						</div>
					)}
				</div>

				<div className="flex gap-2">
					{canEdit && theme.id && (
						<>
							<Button
								intent="primary"
								size="sm"
								onPress={onSave}
								isDisabled={!hasUnsavedChanges || isPending}
							>
								{isPending ? "Saving..." : "Save"}
							</Button>
							<Button
								intent={theme.isPublished ? "outline" : "primary"}
								size="sm"
								onPress={onPublish}
								isDisabled={isPending}
							>
								{theme.isPublished ? "Unpublish" : "Publish"}
							</Button>
						</>
					)}
					{!isOwner && theme.isPublished && (
						<Button intent="outline" size="sm" onPress={onFork} isDisabled={isPending}>
							Fork
						</Button>
					)}
					{canEdit && theme.id && onDelete && (
						<Button intent="danger" size="sm" onPress={onDelete} isDisabled={isPending}>
							Delete
						</Button>
					)}
				</div>
			</div>

			<TextField>
				<Label>Theme Name</Label>
				<Input
					value={theme.name}
					onChange={(e: ChangeEvent<HTMLInputElement>) => {
						onUpdateName(e.target.value);
					}}
					disabled={!canEdit}
					placeholder="My Awesome Theme"
				/>
			</TextField>

			<div>
				<Label htmlFor="blurb">Description</Label>
				<Textarea
					id="blurb"
					value={theme.blurb ?? ""}
					onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
						onUpdateBlurb(e.target.value);
					}}
					disabled={!canEdit}
					placeholder="A brief description of your theme..."
					rows={2}
				/>
			</div>

			{hasUnsavedChanges && (
				<div className="text-sm text-warning">You have unsaved changes</div>
			)}
		</div>
	);
}

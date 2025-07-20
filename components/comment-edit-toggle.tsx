"use client";

import { useState } from "react";
import { CommentEdit } from "./comment-edit";

interface CommentEditToggleProps {
	commentId: number;
	content: string;
	renderedContent?: React.ReactElement;
	canEdit: boolean;
}

export function CommentEditToggle({
	commentId,
	content,
	renderedContent,
	_canEdit,
}: CommentEditToggleProps) {
	const [isEditing, setIsEditing] = useState(false);

	if (isEditing) {
		return (
			<CommentEdit
				commentId={commentId}
				initialContent={content}
				onCancel={() => setIsEditing(false)}
			/>
		);
	}

	return (
		<div className="prose prose-sm max-w-none">
			{renderedContent || <div className="whitespace-pre-wrap">{content}</div>}
		</div>
	);
}

export function CommentEditButton({
	_commentId,
	_content,
	canEdit,
}: {
	commentId: number;
	content: string;
	canEdit: boolean;
}) {
	const [_isEditing, setIsEditing] = useState(false);

	if (!canEdit) return null;

	return (
		<button
			type="button"
			onClick={() => setIsEditing(true)}
			className="text-muted-foreground text-sm hover:text-foreground"
		>
			Edit
		</button>
	);
}

"use client";

import { useTransition } from "react";
import { deleteComment } from "@/lib/comment-actions";

interface CommentDeleteButtonProps {
	commentId: number;
}

export function CommentDeleteButton({ commentId }: CommentDeleteButtonProps) {
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		if (
			window.confirm(
				"Are you sure you want to delete this comment? This action cannot be undone.",
			)
		) {
			startTransition(async () => {
				try {
					await deleteComment(commentId);
				} catch (_error) {
					alert("Failed to delete comment. Please try again.");
				}
			});
		}
	}

	return (
		<button
			type="button"
			onClick={handleDelete}
			disabled={isPending}
			className="text-destructive text-sm hover:text-destructive/80 hover:underline disabled:opacity-50"
		>
			{isPending ? "..." : "Delete"}
		</button>
	);
}

"use client";

import { useState } from "react";
import { CommentAdminToggle } from "./comment-admin-toggle";
import { CommentDeleteButton } from "./comment-delete-button";
import { CommentEdit } from "./comment-edit";

interface CommentItemProps {
	comment: {
		id: number;
		authorGithubUsername: string;
		content: string;
		renderedContent?: React.ReactElement;
		isHidden: boolean;
		createdAt: Date;
	};
	isAdmin: boolean;
	currentUsername?: string;
}

function formatCommentDate(date: Date): string {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const isToday = date.toDateString() === today.toDateString();
	const isYesterday = date.toDateString() === yesterday.toDateString();

	const fullDate = date.toLocaleDateString("en", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	if (isToday) {
		return `Today, ${fullDate}`;
	}

	if (isYesterday) {
		return `Yesterday, ${fullDate}`;
	}

	// For all other dates, just return the full date
	return fullDate;
}

export function CommentItem({ comment, isAdmin, currentUsername }: CommentItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const canEdit = currentUsername === comment.authorGithubUsername || isAdmin;

	if (isEditing) {
		return (
			<div className="space-y-2">
				<div className="flex items-start gap-3">
					<img
						src={`https://github.com/${comment.authorGithubUsername}.png`}
						alt={`@${comment.authorGithubUsername}`}
						className="h-8 w-8 rounded-full"
					/>
					<div className="flex-1">
						<div className="mb-3 flex items-center gap-2">
							<a
								href={`https://github.com/${comment.authorGithubUsername}`}
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium hover:underline"
							>
								@{comment.authorGithubUsername}
							</a>
							<span className="text-muted-foreground">
								{formatCommentDate(comment.createdAt)}
							</span>
						</div>
						<CommentEdit
							commentId={comment.id}
							initialContent={comment.content}
							onCancel={() => setIsEditing(false)}
						/>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-2 ${comment.isHidden ? "opacity-50" : ""}`}>
			<div className="flex items-start gap-3">
				<img
					src={`https://github.com/${comment.authorGithubUsername}.png`}
					alt={`@${comment.authorGithubUsername}`}
					className="h-8 w-8 rounded-full"
				/>
				<div className="flex-1 space-y-1">
					<div className="flex items-center gap-2">
						<a
							href={`https://github.com/${comment.authorGithubUsername}`}
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium hover:underline"
						>
							{comment.authorGithubUsername}
						</a>
						<span className="text-muted-foreground">
							{formatCommentDate(comment.createdAt)}
						</span>
						{canEdit && (
							<button
								type="button"
								onClick={() => setIsEditing(true)}
								className="text-primary hover:text-primary/80 hover:underline"
							>
								Edit
							</button>
						)}
						{canEdit && <CommentDeleteButton commentId={comment.id} />}
						{isAdmin && (
							<CommentAdminToggle
								commentId={comment.id}
								isHidden={comment.isHidden}
							/>
						)}
					</div>
					<div className="max-w-none [&>*]:first:mt-0">
						{comment.renderedContent || (
							<div className="whitespace-pre-wrap">{comment.content}</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

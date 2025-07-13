import { CommentItem } from "./comment-item";

interface CommentData {
	id: number;
	postSlug: string;
	authorGithubId: number;
	authorGithubUsername: string;
	authorAvatarUrl: string;
	content: string;
	renderedContent?: React.ReactElement;
	isHidden: boolean;
	createdAt: Date;
}

interface CommentsListProps {
	comments: CommentData[];
	isAdmin: boolean;
	currentUsername?: string;
}

export function CommentsList({
	comments,
	isAdmin: isAdminUser,
	currentUsername,
}: CommentsListProps) {
	if (comments.length === 0) {
		return (
			<div className="py-8 text-center text-muted-foreground text-sm">
				No comments yet. Be the first to comment!
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{comments.map((comment) => (
				<CommentItem
					key={comment.id}
					comment={comment}
					isAdmin={isAdminUser}
					currentUsername={currentUsername}
				/>
			))}
		</div>
	);
}

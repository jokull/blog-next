import { CommentForm } from "./comment-form";
import { CommentsList } from "./comments-list";

interface User {
	email: string;
	githubId: number;
	githubUsername: string;
	name: string;
	avatarUrl: string;
}

interface CommentData {
	id: number;
	postSlug: string;
	authorGithubId: number;
	authorGithubUsername: string;
	authorAvatarUrl: string;
	content: string;
	isHidden: boolean;
	createdAt: Date;
}

interface CommentsSectionProps {
	postSlug: string;
	user: User | null;
	comments: CommentData[];
	commentCount: number;
	isAdmin: boolean;
	currentUsername?: string;
}

export function CommentsSection({
	postSlug,
	user,
	comments,
	commentCount,
	isAdmin,
	currentUsername,
}: CommentsSectionProps) {
	return (
		<div className="space-y-6">
			<h3 className="font-medium text-lg">
				Comments <span className="text-neutral-400">{commentCount}</span>
			</h3>
			<CommentsList comments={comments} isAdmin={isAdmin} currentUsername={currentUsername} />
			<CommentForm postSlug={postSlug} user={user} />
		</div>
	);
}

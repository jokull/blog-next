"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getGithubUser, getSession, isAdmin } from "@/auth";
import { db } from "@/drizzle.config";
import { Comment } from "@/schema";

export async function createComment(postSlug: string, content: string) {
	const session = await getSession();
	if (!session.githubUsername) {
		throw new Error("Please sign in to comment");
	}

	if (!content || typeof content !== "string") {
		throw new Error("Content is required");
	}

	// Get GitHub user info
	const githubUser = await getGithubUser(session.githubUsername);

	const comment = await db
		.insert(Comment)
		.values({
			postSlug,
			authorGithubId: githubUser.id,
			authorGithubUsername: githubUser.login,
			authorAvatarUrl: githubUser.avatar_url,
			content: content.trim(),
		})
		.returning();

	revalidatePath(`/${postSlug}`);
	return comment[0];
}

export async function updateComment(commentId: number, content: string) {
	const session = await getSession();
	if (!session.githubUsername) {
		throw new Error("Please sign in to edit comments");
	}

	if (!content || typeof content !== "string") {
		throw new Error("Content is required");
	}

	// Get the comment to verify ownership
	const existingComment = await db.query.Comment.findFirst({
		where: eq(Comment.id, commentId),
	});

	if (!existingComment) {
		throw new Error("Comment not found");
	}

	// Check if user is the author or admin
	const isCommentAuthor = existingComment.authorGithubUsername === session.githubUsername;
	const isAdminUser = await isAdmin();

	if (!isCommentAuthor && !isAdminUser) {
		throw new Error("You can only edit your own comments");
	}

	const updatedComment = await db
		.update(Comment)
		.set({ content: content.trim() })
		.where(eq(Comment.id, commentId))
		.returning();

	// Revalidate the post page
	const postSlug = updatedComment[0].postSlug;
	revalidatePath(`/${postSlug}`);

	return updatedComment[0];
}

export async function toggleCommentHidden(commentId: number, isHidden: boolean) {
	const adminCheck = await isAdmin();
	if (!adminCheck) {
		throw new Error("Admin access required");
	}

	const updatedComment = await db
		.update(Comment)
		.set({ isHidden })
		.where(eq(Comment.id, commentId))
		.returning();

	if (updatedComment.length === 0) {
		throw new Error("Comment not found");
	}

	// Revalidate the post page
	const postSlug = updatedComment[0].postSlug;
	revalidatePath(`/${postSlug}`);

	return updatedComment[0];
}

export async function deleteComment(commentId: number) {
	const session = await getSession();
	if (!session.githubUsername) {
		throw new Error("Please sign in to delete comments");
	}

	// Get the comment to verify ownership
	const existingComment = await db.query.Comment.findFirst({
		where: eq(Comment.id, commentId),
	});

	if (!existingComment) {
		throw new Error("Comment not found");
	}

	// Check if user is the author or admin
	const isCommentAuthor = existingComment.authorGithubUsername === session.githubUsername;
	const isAdminUser = await isAdmin();

	if (!isCommentAuthor && !isAdminUser) {
		throw new Error("You can only delete your own comments");
	}

	const deletedComment = await db.delete(Comment).where(eq(Comment.id, commentId)).returning();

	if (deletedComment.length === 0) {
		throw new Error("Comment not found");
	}

	// Revalidate the post page
	const postSlug = deletedComment[0].postSlug;
	revalidatePath(`/${postSlug}`);

	return deletedComment[0];
}

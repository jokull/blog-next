#!/usr/bin/env bun

import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import * as yaml from "js-yaml";
import { db } from "./drizzle.config";
import { Post } from "./schema"; // Assuming your schema is in this file

// Define the structure for blog post metadata
interface BlogPost {
	slug: string;
	title: string;
	date: Date;
	isDraft: boolean;
	wordCount: number;
	content: string;
}

// Define the structure for frontmatter
interface Frontmatter {
	title?: string;
	date?: string | Date;
	isDraft?: boolean;
}

// Function to parse YAML frontmatter from markdown content
function parseFrontmatter(content: string): {
	frontmatter: Frontmatter;
	markdown: string;
} {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return { frontmatter: {}, markdown: content };
	}

	try {
		const frontmatter = yaml.load(match[1]) as Frontmatter;
		// Clean up whitespace and linebreaks around the markdown
		const markdown = match[2].trim();
		return { frontmatter, markdown };
	} catch (_error) {
		return { frontmatter: {}, markdown: content.trim() };
	}
}

// Function to count words in a string
function countWords(text: string): number {
	return text.trim().split(/\s+/).length;
}

// Function to create a UTC midnight timestamp from a date
function getUTCMidnightTimestamp(date: Date): Date {
	const utcDate = new Date(date);
	utcDate.setUTCHours(0, 0, 0, 0);
	return utcDate;
}

// Function to scan directory and parse blog posts
function scanBlogPosts(rootDir: string): BlogPost[] {
	const posts: BlogPost[] = [];
	const rootPath = resolve(rootDir);

	try {
		const directories = readdirSync(rootPath, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);

		for (const dir of directories) {
			const dirPath = join(rootPath, dir);
			const postPath = join(dirPath, "post.md");

			try {
				const fileContent = readFileSync(postPath, "utf-8");
				const { frontmatter, markdown } = parseFrontmatter(fileContent);

				// Set default values if properties are missing
				const title = frontmatter.title ?? "Untitled";
				const date = frontmatter.date ? new Date(frontmatter.date) : new Date(0);
				const isDraft = frontmatter.isDraft ?? false;

				posts.push({
					slug: dir,
					title,
					date,
					isDraft,
					wordCount: countWords(markdown),
					content: markdown,
				});
			} catch (_error) {}
		}

		// Sort posts by date (newest first)
		return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
	} catch (_error) {
		return [];
	}
}

// Function to insert blog posts into the database
async function importPostsToDatabase(posts: BlogPost[]) {
	let _importedCount = 0;
	let _skippedCount = 0;

	for (const post of posts) {
		try {
			const utcMidnight = getUTCMidnightTimestamp(post.date);

			// Insert or update post in database
			await db
				.insert(Post)
				.values({
					slug: post.slug,
					title: post.title,
					markdown: post.content,
					previewMarkdown: null,
					publicAt: post.isDraft ? null : utcMidnight,
					publishedAt: utcMidnight,
					modifiedAt: new Date(),
				})
				.onConflictDoUpdate({
					target: Post.slug,
					set: {
						title: post.title,
						markdown: post.content,
						previewMarkdown: null,
						publicAt: post.isDraft ? null : utcMidnight,
						publishedAt: utcMidnight,
						modifiedAt: new Date(),
					},
				});
			_importedCount++;
		} catch (_error) {
			_skippedCount++;
		}
	}
}

// Function to display blog post statistics
function displayBlogStats(posts: BlogPost[]) {
	const publishedPosts = posts.filter((post) => !post.isDraft);
	const _draftPosts = posts.filter((post) => post.isDraft);

	if (publishedPosts.length > 0) {
		const totalWords = publishedPosts.reduce((sum, post) => sum + post.wordCount, 0);
		const _avgWords = Math.round(totalWords / publishedPosts.length);
		const _oldestPost = publishedPosts[publishedPosts.length - 1];
		const _newestPost = publishedPosts[0];
		const postsByYear = publishedPosts.reduce(
			(acc, post) => {
				const year = post.date.getFullYear();
				acc[year] = (acc[year] || 0) + 1;
				return acc;
			},
			{} as Record<number, number>,
		);
		Object.entries(postsByYear)
			.sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
			.forEach(([_year, _count]) => {});
	}
}

// Function to display blog posts
function displayBlogPosts(posts: BlogPost[]) {
	posts.forEach((post, _index) => {
		const _status = post.isDraft ? "🔒 DRAFT" : "✅ PUBLISHED";
		const _dateStr = post.date.toLocaleDateString("en-IS");
	});
}

// Main function
async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		process.exit(1);
	}

	const rootDir = args[0];

	const posts = scanBlogPosts(rootDir);

	if (posts.length === 0) {
		process.exit(0);
	}

	displayBlogStats(posts);
	displayBlogPosts(posts);

	// Import posts to database
	await importPostsToDatabase(posts);
}

// Run the script
main().catch((_error: unknown) => {
	process.exit(1);
});

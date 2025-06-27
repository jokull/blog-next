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

// Function to parse YAML frontmatter from markdown content
function parseFrontmatter(content: string): {
	// biome-ignore lint/suspicious/noExplicitAny: YAML frontmatter can contain any structure
	frontmatter: any;
	markdown: string;
} {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return { frontmatter: {}, markdown: content };
	}

	try {
		const frontmatter = yaml.load(match[1]);
		// Clean up whitespace and linebreaks around the markdown
		const markdown = match[2].trim();
		return { frontmatter, markdown };
	} catch (error) {
		console.error("Error parsing frontmatter:", error);
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
				const title = frontmatter.title || "Untitled";
				const date = frontmatter.date
					? new Date(frontmatter.date)
					: new Date(0);
				const isDraft =
					frontmatter.isDraft !== undefined ? frontmatter.isDraft : false;

				posts.push({
					slug: dir,
					title,
					date,
					isDraft,
					wordCount: countWords(markdown),
					content: markdown,
				});
			} catch (error) {
				console.error(`Error processing ${postPath}:`, error);
			}
		}

		// Sort posts by date (newest first)
		return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
	} catch (error) {
		console.error("Error scanning blog directory:", error);
		return [];
	}
}

// Function to insert blog posts into the database
async function importPostsToDatabase(posts: BlogPost[]) {
	console.log("\n💾 IMPORTING TO DATABASE");
	console.log("=======================");

	let importedCount = 0;
	let skippedCount = 0;

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

			console.log(
				`✅ Imported: ${post.slug} (${post.isDraft ? "Draft" : "Published"})`,
			);
			importedCount++;
		} catch (error) {
			console.error(`❌ Error importing ${post.slug}:`, error);
			skippedCount++;
		}
	}

	console.log(
		`\nImport complete: ${importedCount} imported, ${skippedCount} skipped`,
	);
}

// Function to display blog post statistics
function displayBlogStats(posts: BlogPost[]) {
	const publishedPosts = posts.filter((post) => !post.isDraft);
	const draftPosts = posts.filter((post) => post.isDraft);

	console.log("\n📊 BLOG STATISTICS");
	console.log("=================");
	console.log(`Total Posts: ${posts.length}`);
	console.log(`Published: ${publishedPosts.length}`);
	console.log(`Drafts: ${draftPosts.length}`);

	if (publishedPosts.length > 0) {
		const totalWords = publishedPosts.reduce(
			(sum, post) => sum + post.wordCount,
			0,
		);
		const avgWords = Math.round(totalWords / publishedPosts.length);
		const oldestPost = publishedPosts[publishedPosts.length - 1];
		const newestPost = publishedPosts[0];
		const postsByYear = publishedPosts.reduce(
			(acc, post) => {
				const year = post.date.getFullYear();
				acc[year] = (acc[year] || 0) + 1;
				return acc;
			},
			{} as Record<number, number>,
		);

		console.log(`Total Words: ${totalWords.toLocaleString("en-IS")}`);
		console.log(`Average Words Per Post: ${avgWords.toLocaleString("en-IS")}`);
		console.log(
			`Date Range: ${oldestPost.date.toLocaleDateString(
				"en-IS",
			)} to ${newestPost.date.toLocaleDateString("en-IS")}`,
		);

		console.log("\nPosts by Year:");
		Object.entries(postsByYear)
			.sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
			.forEach(([year, count]) => {
				console.log(`  ${year}: ${count} posts`);
			});
	}
}

// Function to display blog posts
function displayBlogPosts(posts: BlogPost[]) {
	console.log("\n📝 BLOG POSTS");
	console.log("=============");

	posts.forEach((post, index) => {
		const status = post.isDraft ? "🔒 DRAFT" : "✅ PUBLISHED";
		const dateStr = post.date.toLocaleDateString("en-IS");

		console.log(`\n#${index + 1}: ${post.title}`);
		console.log(`Slug: ${post.slug}`);
		console.log(`Status: ${status}`);
		console.log(`Date: ${dateStr}`);
		console.log(`Words: ${post.wordCount.toLocaleString("en-IS")}`);
	});
}

// Main function
async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Please provide the root blog directory path");
		process.exit(1);
	}

	const rootDir = args[0];
	console.log(`Scanning blog posts in: ${resolve(rootDir)}`);

	const posts = scanBlogPosts(rootDir);

	if (posts.length === 0) {
		console.log("No blog posts found");
		process.exit(0);
	}

	displayBlogStats(posts);
	displayBlogPosts(posts);

	// Import posts to database
	await importPostsToDatabase(posts);
}

// Run the script
main().catch((error) => {
	console.error("Error running script:", error);
	process.exit(1);
});

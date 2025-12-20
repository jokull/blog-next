import { db } from "@/drizzle.config";
import { Post } from "@/schema";
import { eq, isNotNull } from "drizzle-orm";
import { readFileSync } from "fs";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { join } from "path";
import { cache } from "react";

// Runtime configuration for Node.js (required for fs operations)
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600; // Cache for 1 hour

// Load assets at module level for performance
const profilePicData = readFileSync(join(process.cwd(), "public/baldur-square.jpg"));
const profilePicBase64 = `data:image/jpeg;base64,${profilePicData.toString("base64")}`;

const fontBoldData = readFileSync(join(process.cwd(), "app/_fonts/Inter-Bold.ttf"));
const fontMediumData = readFileSync(join(process.cwd(), "app/_fonts/Inter-Medium.ttf"));

// Cache database query for reuse
const getPost = cache(async (slug: string) => {
	const post = await db.query.Post.findFirst({ where: eq(Post.slug, slug) });
	if (!post) {
		notFound();
	}
	return post;
});

// Generate static OG images at build time
export async function generateStaticParams() {
	const posts = await db.query.Post.findMany({
		columns: { slug: true },
		where: isNotNull(Post.publicAt),
	});
	return posts.map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const post = await getPost(slug);

	// Format date based on locale
	const formattedDate = post.publishedAt.toLocaleDateString(post.locale, {
		dateStyle: "long",
	});

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				backgroundColor: "#155dfc",
				padding: 80,
				fontFamily: "Inter",
			}}
		>
			{/* Profile Picture */}
			<img
				src={profilePicBase64}
				width={120}
				height={120}
				alt="Profile"
				style={{
					borderRadius: "50%",
				}}
			/>

			{/* Post Title */}
			<div
				style={{
					fontSize: 56,
					fontWeight: 700,
					color: "white",
					lineHeight: 1.2,
					marginTop: 40,
				}}
			>
				{post.title}
			</div>

			{/* Author and Date */}
			<div
				style={{
					display: "flex",
					fontSize: 28,
					fontWeight: 500,
					color: "rgba(255, 255, 255, 0.7)",
					marginTop: "auto",
				}}
			>
				Jökull Sólberg · {formattedDate}
			</div>
		</div>,
		{
			...size,
			fonts: [
				{
					name: "Inter",
					data: fontBoldData,
					style: "normal",
					weight: 700,
				},
				{
					name: "Inter",
					data: fontMediumData,
					style: "normal",
					weight: 500,
				},
			],
		},
	);
}

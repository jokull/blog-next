import Image from "next/image";
import Link from "next/link";
import { getRelativeTime } from "@/lib/relative-time";

interface TheaterProps {
	children: React.ReactNode;
	className?: string;
}

export function Theater({ children, className = "" }: TheaterProps) {
	return (
		<div className={`-mx-4 rounded-xl bg-stone-800 text-white leading-tight ${className}`}>
			{children}
		</div>
	);
}

interface HeroPostCardProps {
	slug: string;
	title: string;
	publishedAt: Date;
	heroImage: string;
	excerpt: string;
	locale: "is" | "en";
	commentCount: number;
}

export function HeroPostCard({
	slug,
	title,
	publishedAt,
	heroImage,
	excerpt,
	locale,
	commentCount,
}: HeroPostCardProps) {
	const isLocalImage = heroImage.startsWith("./assets/images/");
	const imageSrc = isLocalImage ? heroImage.replace("./assets/images/", "") : heroImage;

	return (
		<Link href={`/${slug}`} className="block">
			<article className="group -mx-4 mb-8 overflow-hidden rounded-xl text-white transition-all">
				<div className="relative aspect-[16/9] overflow-hidden">
					{isLocalImage ? (
						<div className="h-full w-full">
							<Image
								src={require(`../assets/images/${imageSrc}`)}
								alt={title}
								fill
								className="object-cover"
								placeholder="blur"
							/>
						</div>
					) : (
						<img src={heroImage} alt={title} className="h-full w-full object-cover" />
					)}

					{/* Dark gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

					{/* Content overlay */}
					<div className="absolute inset-0 flex flex-col justify-end p-4">
						<div className="mb-2 flex items-center gap-2 text-sm text-white/80">
							<time dateTime={publishedAt.toISOString()}>
								{getRelativeTime(publishedAt, locale)}
							</time>
							{commentCount > 0 && (
								<>
									<span>•</span>
									<span>
										{commentCount} comment{commentCount !== 1 ? "s" : ""}
									</span>
								</>
							)}
						</div>
						<h2 className="mb-2 text-balance font-semibold text-white text-xl leading-tight group-hover:text-white/90">
							{title}
						</h2>
						{excerpt && (
							<p className="line-clamp-3 text-white/70 text-xs leading-relaxed">
								{excerpt}
							</p>
						)}
					</div>
				</div>
			</article>
		</Link>
	);
}

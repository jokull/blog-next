"use client";

export function Card({
	image,
	title,
	desc,
	link,
}: {
	image: string;
	title: string;
	desc: string;
	link: string;
}) {
	return (
		<a
			href={link}
			target="_blank"
			rel="noreferrer"
			draggable={false}
			className="group my-7 block select-none overflow-clip rounded-lg border border-blue-border transition-colors hover:bg-white"
		>
			<img
				src={image}
				alt={title}
				className="m-0 aspect-[1.9/1] w-full border-blue-border border-b object-cover"
			/>
			<p className="m-4 mt-3 mb-1 font-semibold">{title}</p>
			<p className="m-4 mt-1 mb-2 text-sm opacity-80">{desc}</p>
			<p className="m-4 mt-1 mb-3 text-blue-200 text-sm transition-colors group-hover:text-blue-300">
				{link}
			</p>
		</a>
	);
}

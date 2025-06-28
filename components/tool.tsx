import type { ReactNode } from "react";

export function Tool({
	url,
	name,
	children,
	description,
}: {
	url: string;
	name: string;
	children: ReactNode;
	description: string;
}) {
	return (
		<div className="mb-8 flex items-start">
			<a href={url} className="mt-1 w-8 shrink-0" target="_blank" rel="noopener noreferrer">
				{children}
			</a>
			<div className="ml-4 leading-snug">
				<a
					href={url}
					className="font-semibold text-lg"
					target="_blank"
					rel="noopener noreferrer"
				>
					{name}
				</a>
				<p>{description}</p>
			</div>
		</div>
	);
}

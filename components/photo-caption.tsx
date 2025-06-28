import type React from "react";

export function PhotoCaption({
	url,
	caption = null,
	wider = false,
	fancy = false,
}: {
	url: string;
	caption?: React.ReactNode;
	wider?: boolean;
	fancy?: boolean;
}) {
	return (
		<div className={`${wider ? "wider" : ""} relative mb-4`}>
			<img
				className={`${fancy ? "rounded-lg shadow-lg" : ""} !my-2`}
				src={url}
				alt={caption?.toString() || ""}
			/>

			{caption &&
				(fancy ? (
					<div className="absolute inset-x-0 bottom-0 text-balance rounded-lg px-4 pt-6 pb-3 text-center text-sm text-white [background-image:var(--smooth-gradient)] ">
						{caption}
					</div>
				) : (
					<div className="my-4 text-balance text-center text-sm">{caption}</div>
				))}
		</div>
	);
}

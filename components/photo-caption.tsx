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
					<div
						className="
              absolute inset-x-0 bottom-0 rounded-lg [background-image:var(--smooth-gradient)] px-4 pb-3 pt-6
              text-center text-sm text-white text-balance
            "
					>
						{caption}
					</div>
				) : (
					<div className="my-4 text-center text-sm text-balance">{caption}</div>
				))}
		</div>
	);
}

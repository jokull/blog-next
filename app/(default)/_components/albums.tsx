import { z } from "zod";

const albumSchema = z.object({
	title: z.string(),
	artist: z.string(),
	coverPath: z.string(),
});

export async function Albums() {
	const albums = await fetch("https://personal.plex.uno/random-albums", {
		cache: "no-cache",
	})
		.then((r) => r.json())
		.then(z.array(albumSchema).parse)
		.catch(() => []);

	return (
		<div className="-mx-6 flex gap-3 overflow-y-auto px-6 sm:grid sm:grid-cols-4 md:grid-cols-5 [&>*]:w-32 [&>*]:flex-shrink-0 sm:[&>*]:w-auto">
			{albums.map((album) => (
				<div
					key={`${album.artist}-${album.title}`}
					className="aspect-square overflow-hidden rounded-lg"
				>
					<img
						src={`https://personal.plex.uno${album.coverPath}`}
						alt={`${album.title} by ${album.artist}`}
						width={128}
						height={128}
						className="h-full w-full object-cover"
					/>
				</div>
			))}
		</div>
	);
}

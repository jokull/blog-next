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
		<div className="-mx-6">
			<div className="inline-flex gap-3 overflow-y-auto px-6 md:grid md:w-full md:grid-cols-5 md:overflow-y-visible">
				{albums.map((album) => (
					<img
						key={`${album.artist}-${album.title}`}
						alt={`${album.title} by ${album.artist}`}
						src={`https://personal.plex.uno${album.coverPath}`}
						className="aspect-square w-24 rounded-sm object-cover shadow-lg sm:w-32 md:w-full"
					/>
				))}
			</div>
		</div>
	);
}

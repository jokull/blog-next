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
		<div className="-mx-6 flex gap-3 px-6 sm:grid sm:grid-cols-4 md:grid-cols-5 [&>*]:flex-shrink-0">
			{albums.map((album) => (
				<img
					key={`${album.artist}-${album.title}`}
					alt={`${album.title} by ${album.artist}`}
					src={`https://personal.plex.uno${album.coverPath}`}
					width={128}
					height={128}
					className="aspect-square rounded-sm object-cover shadow-lg"
				/>
			))}
		</div>
	);
}

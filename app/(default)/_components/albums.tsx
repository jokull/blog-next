import { z } from "zod";
import { safeFetchJson, safeZodParse } from "@/lib/safe-utils";

const albumSchema = z.object({
	title: z.string(),
	artist: z.string(),
	coverPath: z.string(),
});

const albumsSchema = z.array(albumSchema);

export async function Albums() {
	const result = await safeFetchJson("https://personal.plex.uno/random-albums", {
		signal: AbortSignal.timeout(3000),
	});
	const albums = result.andThen(safeZodParse(albumsSchema)).unwrapOr([]);

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

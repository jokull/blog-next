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
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{albums.map((album) => (
				<div key={`${album.artist}-${album.title}`} className="flex flex-col gap-1">
					<div className="aspect-square overflow-hidden rounded-lg">
						<img
							src={`https://personal.plex.uno${album.coverPath}`}
							alt={`${album.title} by ${album.artist}`}
							width={128}
							height={128}
							className="h-full w-full object-cover"
						/>
					</div>
					<div className="font-medium text-sm">{album.title}</div>
					<div className="text-gray-500 text-xs">{album.artist}</div>
				</div>
			))}
		</div>
	);
}

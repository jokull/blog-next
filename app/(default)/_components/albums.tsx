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
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
			{albums.map((album) => (
				<div
					key={`${album.artist}-${album.title}`}
					className="flex flex-col gap-1"
				>
					<div className="overflow-hidden rounded-lg aspect-square">
						<img
							src={`https://personal.plex.uno${album.coverPath}`}
							alt={`${album.title} by ${album.artist}`}
							width={128}
							height={128}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="text-sm font-medium">{album.title}</div>
					<div className="text-xs text-gray-500">{album.artist}</div>
				</div>
			))}
		</div>
	);
}

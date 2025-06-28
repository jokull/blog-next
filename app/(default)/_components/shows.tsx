import { z } from "zod";

const showSchema = z.object({
	title: z.string(),
	thumb: z.string(),
	poster: z.string(),
});

export async function RecentShows() {
	const shows = await fetch("https://personal.plex.uno/recent-shows", {
		cache: "no-cache",
	})
		.then((r) => r.json())
		.then(z.array(showSchema).parse)
		.catch(() => []);

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{shows.map((show) => (
				<div key={show.title} className="flex flex-col gap-1">
					<div className="w-full overflow-hidden rounded-lg">
						<img
							src={`https://personal.plex.uno${show.poster}`}
							alt={show.title}
							width={80}
							height={112}
							className="h-full w-full object-cover"
						/>
					</div>
					<div className="flex flex-col">
						<div className="font-medium text-sm">{show.title}</div>
					</div>
				</div>
			))}
		</div>
	);
}

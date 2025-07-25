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
		<div className="-mx-6 flex gap-3 overflow-y-auto px-6 sm:grid sm:grid-cols-3 md:grid-cols-5 [&>*]:flex-shrink-0 sm:[&>*]:w-auto">
			{shows.map((show) => (
				<div key={show.title} className="flex flex-col gap-1">
					<div className="w-full overflow-hidden rounded-lg">
						<img
							src={`https://personal.plex.uno${show.poster}`}
							alt={show.title}
							className="aspect-[10/16] h-full w-24 object-cover sm:w-32"
						/>
					</div>
				</div>
			))}
		</div>
	);
}

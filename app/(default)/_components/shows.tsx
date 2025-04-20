import { z } from "zod";

const ShowSchema = z.object({
  title: z.string(),
  thumb: z.string(),
  poster: z.string(),
});

const ShowsResponseSchema = z.array(ShowSchema);

export async function RecentShows() {
  const response = await fetch("https://personal.plex.uno/recent-shows");
  const data = await response.json();
  const shows = ShowsResponseSchema.parse(data);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {shows.map((show) => (
        <div key={show.title} className="flex flex-col gap-1">
          <div className="overflow-hidden rounded-lg w-full">
            <img
              src={`https://personal.plex.uno${show.poster}`}
              alt={show.title}
              width={80}
              height={112}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-medium">{show.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function getRelativeTime(date: Date, locale: "is" | "en" = "en"): string {
	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const isToday = date.toDateString() === today.toDateString();
	const isYesterday = date.toDateString() === yesterday.toDateString();

	if (isToday) {
		return `Today, ${date.toLocaleDateString(locale, {
			month: "long",
			day: "numeric",
			year: "numeric",
		})}`;
	}

	if (isYesterday) {
		return `Yesterday, ${date.toLocaleDateString(locale, {
			month: "long",
			day: "numeric",
			year: "numeric",
		})}`;
	}

	// For all other dates, just return the full date without relative time
	return date.toLocaleDateString(locale, {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

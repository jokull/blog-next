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

	if (diffInDays <= 7 && diffInDays > 1) {
		const dayText = diffInDays === 1 ? "day" : "days";
		return `${diffInDays} ${dayText} ago, ${date.toLocaleDateString(locale, {
			month: "long",
			day: "numeric",
			year: "numeric",
		})}`;
	}

	// Fallback to regular date format
	return date.toLocaleDateString(locale, {
		dateStyle: "long",
	});
}

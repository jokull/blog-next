/**
 * Example usage of the OneDollarStats client
 *
 * This file demonstrates how to use the client with neverthrow's Result types.
 * Not included in the build - for reference only.
 */

/* eslint-disable no-console, @typescript-eslint/no-unused-vars */

import { createStatsClient } from "./onedollarstats";

// Example 1: Get daily visits with error handling
async function exampleGetDailyVisits() {
	const client = createStatsClient();

	const result = await client.getDailyVisits("30d");

	if (result.isErr()) {
		const error = result.error;

		// Handle different error types
		switch (error.type) {
			case "network":
				console.error("Network error:", error.error.message);
				break;
			case "http":
				console.error(`HTTP error ${error.status}:`, error.json);
				break;
			case "parse":
				console.error("Parse error:", error.error.message);
				break;
			case "zod":
				console.error("Validation error:", error.errors);
				break;
		}

		return;
	}

	// Success - data is typed as DailyVisit[]
	const visits = result.value;
	console.log(`Got ${visits.length} days of data`);

	for (const visit of visits) {
		console.log(`${visit.date}: ${visit.visitors} visitors, ${visit.pageviews} pageviews`);
	}
}

// Example 2: Get aggregate stats
async function exampleGetStats() {
	const client = createStatsClient();

	const result = await client.getStats("7d");

	result.match(
		(stats) => {
			console.log(`Last 7 days: ${stats.visitors} visitors, ${stats.pageviews} pageviews`);
		},
		(error) => {
			console.error("Failed to fetch stats:", error);
		},
	);
}

// Example 3: Using with custom date range
async function exampleCustomDateRange() {
	const client = createStatsClient();

	const result = await client.getDailyVisits(["2024-01-01", "2024-01-31"]);

	if (result.isOk()) {
		console.log("January 2024 data:", result.value);
	}
}

// Example 4: Chaining operations with map
async function exampleChaining() {
	const client = createStatsClient();

	const totalVisitors = await client
		.getStats("30d")
		.map((stats) => stats.visitors)
		.mapErr((error) => {
			console.error("Error fetching stats:", error);
			return 0; // Return default value on error
		});

	console.log("Total visitors:", totalVisitors.isOk() ? totalVisitors.value : 0);
}

import { ResultAsync } from "neverthrow";
import { z } from "zod";
import { env } from "@/env";
import { safeFetch, safeZodParse, type FetchError } from "./safe-utils";

const API_ENDPOINT = "https://api.onedollarstats.com/api";
const SITE = "solberg.is";

// Zod schemas
const dateRangeSchema = z.union([
	z.enum(["day", "7d", "30d", "6mo", "12mo", "year", "all"]),
	z.tuple([z.string(), z.string()]),
]);

const metricSchema = z.enum([
	"visitors",
	"visits",
	"pageviews",
	"views_per_visit",
	"bounce_rate",
	"visit_duration",
	"events",
]);

const oneDollarStatsResponseSchema = z.object({
	results: z.array(
		z.object({
			dimensions: z.array(z.string()),
			metrics: z.array(z.number()),
		}),
	),
	meta: z.object({
		imports_included: z.boolean().optional(),
		imports_skip_reason: z.string().optional(),
		imports_warning: z.string().optional(),
		metric_warnings: z
			.record(z.string(), z.object({ code: z.string(), warning: z.string() }))
			.optional(),
		time_labels: z.array(z.string()).optional(),
		total_rows: z.number().optional(),
	}),
	query: z.record(z.string(), z.unknown()),
});

const dailyVisitSchema = z.object({
	date: z.string(),
	visitors: z.number(),
	visits: z.number(),
	pageviews: z.number(),
});

const statsSchema = z.object({
	visitors: z.number(),
	visits: z.number(),
	pageviews: z.number(),
});

// Types inferred from schemas
type DateRange = z.infer<typeof dateRangeSchema>;
type Metric = z.infer<typeof metricSchema>;
type OneDollarStatsResponse = z.infer<typeof oneDollarStatsResponseSchema>;
export type DailyVisit = z.infer<typeof dailyVisitSchema>;
export type Stats = z.infer<typeof statsSchema>;

// Error types
interface ApiError {
	type: "api_error";
	message: string;
}

type OneDollarStatsError = FetchError<unknown> | ApiError | { type: "zod"; errors: z.ZodError };

interface OneDollarStatsRequest {
	site_id: string;
	metrics: Metric[];
	date_range: DateRange;
	dimensions?: string[];
	filters?: unknown[];
	order_by?: [string, "asc" | "desc"][];
	include?: {
		imports?: boolean;
		time_labels?: boolean;
		total_rows?: boolean;
	};
	pagination?: {
		limit?: number;
		offset?: number;
	};
}

export class OneDollarStatsClient {
	private apiKey: string;
	private siteId: string;

	constructor(siteId: string) {
		this.apiKey = env.ONEDOLLARSTATS_API_KEY;
		this.siteId = siteId;
	}

	private request(
		body: Omit<OneDollarStatsRequest, "site_id">,
	): ResultAsync<OneDollarStatsResponse, OneDollarStatsError> {
		return safeFetch(API_ENDPOINT, {
			method: "POST",
			headers: {
				"x-api-key": this.apiKey,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...body,
				site_id: this.siteId,
			}),
		}).andThen((data) => {
			const parseResult = safeZodParse(oneDollarStatsResponseSchema)(data);
			return parseResult.isOk()
				? ResultAsync.fromSafePromise(Promise.resolve(parseResult.value))
				: ResultAsync.fromSafePromise(
						Promise.reject({ type: "zod" as const, errors: parseResult.error.errors }),
					);
		});
	}

	/**
	 * Get daily visits for a given date range
	 * @param dateRange - Date range (e.g., "7d", "30d", ["2024-01-01", "2024-01-31"])
	 * @returns ResultAsync with array of daily visit data or error
	 */
	getDailyVisits(dateRange: DateRange = "30d"): ResultAsync<DailyVisit[], OneDollarStatsError> {
		return this.request({
			metrics: ["visitors", "visits", "pageviews"],
			date_range: dateRange,
			dimensions: ["time:day"],
			order_by: [["time:day", "asc"]],
		}).map((response) =>
			response.results.map((result) => ({
				date: result.dimensions[0],
				visitors: result.metrics[0],
				visits: result.metrics[1],
				pageviews: result.metrics[2],
			})),
		);
	}

	/**
	 * Get weekly visits for a given date range
	 * @param dateRange - Date range (e.g., "30d", "6mo", "year")
	 * @returns ResultAsync with array of weekly visit data or error
	 */
	getWeeklyVisits(dateRange: DateRange = "6mo"): ResultAsync<DailyVisit[], OneDollarStatsError> {
		return this.request({
			metrics: ["visitors", "visits", "pageviews"],
			date_range: dateRange,
			dimensions: ["time:week"],
			order_by: [["time:week", "asc"]],
		}).map((response) =>
			response.results.map((result) => ({
				date: result.dimensions[0],
				visitors: result.metrics[0],
				visits: result.metrics[1],
				pageviews: result.metrics[2],
			})),
		);
	}

	/**
	 * Get aggregate stats for a date range
	 * @param dateRange - Date range (e.g., "7d", "30d")
	 * @returns ResultAsync with aggregate stats or error
	 */
	getStats(dateRange: DateRange = "30d"): ResultAsync<Stats, OneDollarStatsError> {
		return this.request({
			metrics: ["visitors", "visits", "pageviews"],
			date_range: dateRange,
		}).map((response) => {
			if (response.results.length === 0) {
				return { visitors: 0, visits: 0, pageviews: 0 };
			}

			const [visitors, visits, pageviews] = response.results[0].metrics;
			return { visitors, visits, pageviews };
		});
	}
}

/**
 * Create a OneDollarStats client for the current site
 */
export function createStatsClient(): OneDollarStatsClient {
	return new OneDollarStatsClient(SITE);
}

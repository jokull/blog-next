import { err, ok, type Result, ResultAsync, errAsync } from "neverthrow";
import type { z, ZodError, ZodSchema } from "zod";

interface ZodParseError<T> {
	type: "zod";
	errors: ZodError<T>;
}

interface NetworkError {
	type: "network";
	error: Error;
}

interface HttpError<E = unknown> {
	type: "http";
	status: number;
	headers: Headers;
	json?: E;
}

interface ParseError {
	type: "parse";
	error: Error;
}

export type FetchError<E> = NetworkError | HttpError<E> | ParseError;

/**
 * Safe wrapper around Zod schema parsing that returns a Result type
 * instead of throwing errors.
 */
export function safeZodParse<TSchema extends ZodSchema>(
	schema: TSchema,
): (data: unknown) => Result<z.infer<TSchema>, ZodParseError<z.infer<TSchema>>> {
	return (data: unknown) => {
		const result = schema.safeParse(data);
		return result.success ? ok(result.data) : err({ type: "zod", errors: result.error });
	};
}

/**
 * Safe wrapper around fetch that returns a ResultAsync with typed errors.
 * Handles network errors, HTTP errors, and JSON parsing errors.
 */
export function safeFetch<T = unknown, E = unknown>(
	input: URL | string,
	init?: RequestInit,
): ResultAsync<T, FetchError<E>> {
	return ResultAsync.fromPromise(
		fetch(input, init),
		(error): NetworkError => ({
			type: "network",
			error: error instanceof Error ? error : new Error(String(error)),
		}),
	).andThen((response) => {
		if (!response.ok) {
			return ResultAsync.fromSafePromise(response.json().catch(() => undefined)).andThen(
				(json) =>
					errAsync({
						type: "http" as const,
						status: response.status,
						headers: response.headers,
						json: json as E,
					}),
			);
		}

		return ResultAsync.fromPromise(
			response.json() as Promise<T>,
			(error): ParseError => ({
				type: "parse",
				error: error instanceof Error ? error : new Error(String(error)),
			}),
		);
	});
}

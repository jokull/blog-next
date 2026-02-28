// Shim for cross-fetch on Cloudflare Workers.
//
// @libsql/hrana-client (used by @libsql/client/web) imports cross-fetch,
// which pulls in node-fetch and Node's HTTP internals. This breaks on
// Workers where native fetch is available and Node HTTP is not.
//
// This shim re-exports the native globals so the libsql HTTP transport
// uses Workers' built-in fetch instead. Can be removed if @libsql/client
// drops the cross-fetch dependency.
// See: https://github.com/tursodatabase/libsql/issues/1372
export default globalThis.fetch.bind(globalThis);
export const fetch = globalThis.fetch.bind(globalThis);
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;

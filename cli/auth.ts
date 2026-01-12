/* eslint-disable no-console */
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";

const SESSION_FILE = `${process.env.HOME}/.blog-cli-session`;

export function getStoredToken(): string | null {
	if (existsSync(SESSION_FILE)) {
		const content = readFileSync(SESSION_FILE, "utf-8").trim();
		return content || null;
	}
	return null;
}

export function saveToken(token: string) {
	writeFileSync(SESSION_FILE, token, "utf-8");
}

export function clearToken() {
	if (existsSync(SESSION_FILE)) {
		unlinkSync(SESSION_FILE);
	}
}

function getRandomPort(): number {
	return Math.floor(Math.random() * (65535 - 49152) + 49152);
}

export async function login(apiBase: string): Promise<string> {
	const port = getRandomPort();
	const callbackUrl = `http://localhost:${port}/callback`;

	return new Promise((resolve, reject) => {
		let server: ReturnType<typeof Bun.serve> | null = null;

		const timeout = setTimeout(
			() => {
				void server?.stop();
				reject(new Error("Login timed out after 5 minutes"));
			},
			5 * 60 * 1000,
		);

		server = Bun.serve({
			port,
			fetch(req) {
				const url = new URL(req.url);

				if (url.pathname === "/callback") {
					// The API returns the token as "cookie" param (legacy naming)
					const token = url.searchParams.get("cookie");
					if (token) {
						clearTimeout(timeout);
						saveToken(token);
						void server?.stop();
						resolve(token);

						return new Response(
							`<!DOCTYPE html>
<html>
<head><title>Login Successful</title></head>
<body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
	<div style="text-align: center;">
		<h1>Login successful!</h1>
		<p>You can close this window and return to the terminal.</p>
	</div>
</body>
</html>`,
							{ headers: { "Content-Type": "text/html" } },
						);
					}
					return new Response("Missing token parameter", { status: 400 });
				}

				return new Response("Not found", { status: 404 });
			},
		});

		const loginUrl = `${apiBase}/api/cli-auth?callback=${encodeURIComponent(callbackUrl)}`;

		console.log(`Opening browser for authentication...`);
		console.log(`If the browser doesn't open, visit: ${loginUrl}`);

		// Open browser using platform-specific command
		const openCommand =
			process.platform === "darwin"
				? "open"
				: process.platform === "win32"
					? "start"
					: "xdg-open";

		Bun.spawn([openCommand, loginUrl]);
	});
}

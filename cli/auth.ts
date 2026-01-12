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

interface DeviceCodeResponse {
	device_code: string;
	user_code: string;
	verification_uri: string;
	expires_in: number;
	interval: number;
}

interface TokenResponse {
	access_token?: string;
	token_type?: string;
	scope?: string;
	error?: string;
	error_description?: string;
	interval?: number;
}

async function fetchClientId(apiBase: string): Promise<string> {
	const res = await fetch(`${apiBase}/api/oauth-config`);
	if (!res.ok) {
		throw new Error(`Failed to fetch OAuth config: ${res.status}`);
	}
	const data = (await res.json()) as { clientId: string };
	return data.clientId;
}

async function requestDeviceCode(clientId: string): Promise<DeviceCodeResponse> {
	const res = await fetch("https://github.com/login/device/code", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: clientId,
			scope: "user:email",
		}),
	});

	if (!res.ok) {
		throw new Error(`Failed to request device code: ${res.status}`);
	}

	return res.json() as Promise<DeviceCodeResponse>;
}

async function pollForToken(
	clientId: string,
	deviceCode: string,
	interval: number,
): Promise<string> {
	const pollInterval = interval * 1000; // Convert to milliseconds

	while (true) {
		await new Promise((resolve) => setTimeout(resolve, pollInterval));

		const res = await fetch("https://github.com/login/oauth/access_token", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: clientId,
				device_code: deviceCode,
				grant_type: "urn:ietf:params:oauth:grant-type:device_code",
			}),
		});

		const data = (await res.json()) as TokenResponse;

		if (data.access_token) {
			return data.access_token;
		}

		if (data.error === "authorization_pending") {
			// User hasn't authorized yet, keep polling
			continue;
		}

		if (data.error === "slow_down") {
			// We're polling too fast, increase interval
			await new Promise((resolve) => setTimeout(resolve, 5000));
			continue;
		}

		if (data.error === "expired_token") {
			throw new Error("Device code expired. Please try again.");
		}

		if (data.error === "access_denied") {
			throw new Error("Authorization was denied by the user.");
		}

		if (data.error) {
			throw new Error(`OAuth error: ${data.error} - ${data.error_description ?? ""}`);
		}
	}
}

export async function login(apiBase: string): Promise<string> {
	// Fetch client ID from the API
	console.log("Fetching OAuth configuration...");
	const clientId = await fetchClientId(apiBase);

	// Request device code from GitHub
	console.log("Requesting device authorization...");
	const deviceCode = await requestDeviceCode(clientId);

	// Display instructions to user
	console.log("\n" + "─".repeat(50));
	console.log("To authenticate, visit:");
	console.log(`  ${deviceCode.verification_uri}`);
	console.log("\nAnd enter the code:");
	console.log(`  ${deviceCode.user_code}`);
	console.log("─".repeat(50) + "\n");
	console.log("Waiting for authorization...");

	// Poll for token
	const accessToken = await pollForToken(clientId, deviceCode.device_code, deviceCode.interval);

	// Save the token
	saveToken(accessToken);

	return accessToken;
}

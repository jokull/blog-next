"use client";

import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

function fallbackRender({ error }: { error: unknown }) {
	return (
		<div role="alert">
			<p>Something went wrong:</p>
			<pre style={{ color: "red" }}>
				{Error.isError(error) ? error.message : String(error)}
			</pre>
		</div>
	);
}

export function ClientErrorBoundary({ children }: { children: ReactNode }) {
	return (
		<ErrorBoundary
			fallbackRender={fallbackRender}
			onReset={(_details) => {
				// Reset the state of your app so the error doesn't happen again
			}}
		>
			{children}
		</ErrorBoundary>
	);
}

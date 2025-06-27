import cn from "clsx";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "./globals.css";

const sans = localFont({
	src: "./_fonts/InterVariable.woff2",
	preload: true,
	variable: "--sans",
});

const serif = localFont({
	src: "./_fonts/LoraItalicVariable.woff2",
	preload: true,
	variable: "--serif",
});

const mono = localFont({
	src: "./_fonts/IosevkaFixedCurly-ExtendedMedium.woff2",
	preload: true,
	variable: "--mono",
});

export const metadata: Metadata = {
	title: {
		template: "%s - Jökull Sólberg",
		default: "Jökull Sólberg",
	},
};

export const viewport: Viewport = {
	maximumScale: 1,
	colorScheme: "only light",
	themeColor: "#fcfcfc",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="touch-manipulation">
			<body
				className={cn(
					sans.variable,
					serif.variable,
					mono.variable,
					"relative",
					"text-sm leading-6 sm:text-[15px] sm:leading-7 md:text-base md:leading-7",
					"text-rurikon-500",
					"antialiased",
				)}
			>
				{children}
			</body>
		</html>
	);
}

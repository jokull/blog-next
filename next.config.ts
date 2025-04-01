import { NextConfig } from "next";

export default {
  experimental: {
    authInterrupts: true,
  },
  transpilePackages: ["shiki"],
  images: {
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
} satisfies NextConfig;

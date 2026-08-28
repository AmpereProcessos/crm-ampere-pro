import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
	reactStrictMode: false,
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		minimumCacheTTL: 2678400,
		remotePatterns: [
			{ protocol: "https", hostname: "avatars.githubusercontent.com" },
			{ protocol: "https", hostname: "firebasestorage.googleapis.com" },
			{ protocol: "https", hostname: "sc-erp.s3.amazonaws.com" },
			{ protocol: "https", hostname: "lh3.googleusercontent.com" },
			{ protocol: "http", hostname: "localhost" },
		],
	},
};

// Produção/build: workflow ligado. Dev: desligado por padrão.
const enableWorkflow =
	process.env.NODE_ENV === "production" ||
	process.env.WORKFLOW_DEV === "1";

export default enableWorkflow
	? withWorkflow(nextConfig)
	: nextConfig;

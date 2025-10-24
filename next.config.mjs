/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		minimumCacheTTL: 2678400, // 1 minute
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
			{
				protocol: "https",
				hostname: "firebasestorage.googleapis.com",
			},
			{
				protocol: "https",
				hostname: "sc-erp.s3.amazonaws.com",
			},
			{
				protocol: "http",
				hostname: "localhost",
			},
		],
	},
};

export default nextConfig;
// module.exports = nextConfig;

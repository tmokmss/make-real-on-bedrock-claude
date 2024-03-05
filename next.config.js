/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: 'standalone',
	headers() {
		return [
			{
				source: '/favicon.svg',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=2592000, stale-while-revalidate=86400',
					},
				],
			},
		]
	},
}

module.exports = nextConfig

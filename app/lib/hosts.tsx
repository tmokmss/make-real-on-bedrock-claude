const env = process.env.NEXT_PUBLIC_ENV === 'production' ? 'production' : 'development'

export const LINK_HOST = {
	production: process.env.NEXT_PUBLIC_LINK_HOST,
	development: 'makereal-link.localhost:3000',
}[env]

export const APP_HOST = {
	production: process.env.NEXT_PUBLIC_APP_HOST,
	development: 'localhost:3000',
}[env]

export const PROTOCOL = env === 'development' ? 'http://' : 'https://'

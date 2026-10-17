// Per-site settings for the video + article pages (components/videos, lib/video-articles).
// The same files are used on nikbearbrown.com with different values here.
export const VIDEO_BASE = '/ai' // route prefix: /ai, /ai/<slug>
export const SITE_NAME = 'Bear Brown'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bearbrown.co'
export const CHANNEL_URL = 'https://www.youtube.com/@NikBearBrown'
export const SECTION_TITLE = 'AI' // breadcrumb + page titles
export const PLAYLIST_PAGES = false // one playlist ("How to AI") is the whole section, so no series pages

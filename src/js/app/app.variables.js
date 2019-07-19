export const qs = document.querySelector.bind(document)
export const qsa = document.querySelectorAll.bind(document)
export const body = document.body

/* Iframe SRC video */
export const iframeVideo = [
  'iframe[src*="player.vimeo.com"]',
  'iframe[src*="dailymotion.com"]',
  'iframe[src*="youtube.com"]',
  'iframe[src*="youtube-nocookie.com"]',
  'iframe[src*="player.twitch.tv"]',
  'iframe[src*="kickstarter.com"][src*="video.html"]'
]

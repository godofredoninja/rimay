/* global siteUrl */

// import external dependencies
import 'lazysizes'

// Impost
import { loadScript } from './app/app.load-style-script'

//
/* Iframe SRC video */
const iframeVideo = [
  'iframe[src*="player.vimeo.com"]',
  'iframe[src*="dailymotion.com"]',
  'iframe[src*="youtube.com"]',
  'iframe[src*="youtube-nocookie.com"]',
  'iframe[src*="vid.me"]',
  'iframe[src*="kickstarter.com"][src*="video.html"]'
]

const setup = () => {
  const qs = document.querySelector.bind(document)
  const qsa = document.querySelectorAll.bind(document)

  const rimayBody = document.body

  // Article Page
  // -----------------------------------------------------------------------------
  if (rimayBody.classList.contains('is-article')) {
    // highlight prismjs
    // -----------------------------------------------------------------------------
    if (qsa('.article-inner pre').length) {
      loadScript(`${siteUrl}/assets/scripts/prismjs.js`)
    }

    // gallery
    // -----------------------------------------------------------------------------
    qsa('.kg-gallery-image > img').forEach(item => {
      const container = item.closest('.kg-gallery-image')
      const width = item.attributes.width.value
      const height = item.attributes.height.value
      const ratio = width / height
      container.style.flex = ratio + ' 1 0%'
    })

    // add class for zoom img => medium zoom Image
    qsa('.article-inner img').forEach(el => !el.closest('a') && el.classList.add('rimay-zoom'))

    // medium-zoom
    const rimayZoom = qsa('.rimay-zoom')
    if (rimayZoom.length) {
      loadScript('https://unpkg.com/medium-zoom@1.0.4/dist/medium-zoom.min.js', () => {
        // https://github.com/francoischalifour/medium-zoom#api
        window.mediumZoom('.rimay-zoom', {
          margin: 20,
          background: 'hsla(0,0%,100%,.85)'
        })
      })
    }

    // Video Responsive
    // -----------------------------------------------------------------------------
    const allIframeVideo = qsa(iframeVideo.join(','))

    if (allIframeVideo.length) {
      allIframeVideo.forEach(el => {
        const parentForVideo = document.createElement('div')
        parentForVideo.className = 'video-responsive'
        el.parentNode.insertBefore(parentForVideo, el)
        parentForVideo.appendChild(el)
      })
    }
  }
}

window.addEventListener('load', setup)

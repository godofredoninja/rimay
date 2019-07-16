/* global siteUrl */

// import external dependencies
import 'lazysizes'
import mediumZoom from 'medium-zoom'

// Impost App
import instagram from './app/app.instagram'
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

  // Toggle Menu
  // -----------------------------------------------------------------------------
  qs('.js-toggle-menu').addEventListener('click', e => {
    e.preventDefault()
    rimayBody.classList.toggle('has-menu')
  })

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
    mediumZoom('.rimay-zoom', {
      margin: 20,
      background: 'hsla(0,0%,100%,.85)'
    })
    // const rimayZoom = qsa('.rimay-zoom')
    // if (rimayZoom.length) {
    //   loadScript('https://unpkg.com/medium-zoom@1.0.4/dist/medium-zoom.min.js', () => {
    //     // https://github.com/francoischalifour/medium-zoom#api
    //     window.mediumZoom('.rimay-zoom', {
    //       margin: 20,
    //       background: 'hsla(0,0%,100%,.85)'
    //     })
    //   })
    // }

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

    // Video Responsive
    // -----------------------------------------------------------------------------
    const instagramFeed = {
      token: '1397790551.1aa422d.37dca7d33ba34544941e111aa03e85c7',
      userId: '1397790551',
      userName: 'GodoFredoNinja'
    }

    const url = `https://api.instagram.com/v1/users/${instagramFeed.userId}/media/recent/?access_token=${instagramFeed.token}&count=10&callback=?`
    const user = `<a href="https://www.instagram.com/${instagramFeed.userName}" class="instagram-btn" target="_blank" rel="noopener noreferrer">@${instagramFeed.userName}</a>`

    if (window.innerWidth > 768) {
      instagram(url, user)
    }
  }
}

window.addEventListener('load', setup)

/* global siteUrl */

import mediumZoom from 'medium-zoom'

// Variables
import * as rimay from '../app/app.variables'
import { loadScript } from '../app/app.load-style-script'
import instagram from '../app/app.instagram'

export default {
  init () {
    // Video Responsive
    // -----------------------------------------------------------------------------
    const allIframeVideo = rimay.qsa(rimay.iframeVideo.join(','))
    if (allIframeVideo.length) {
      allIframeVideo.forEach(el => {
        const parentForVideo = document.createElement('div')
        parentForVideo.className = 'video-responsive'
        el.parentNode.insertBefore(parentForVideo, el)
        parentForVideo.appendChild(el)
      })
    }
  }, // End Init

  finalize () {
    // gallery
    // -----------------------------------------------------------------------------
    rimay.qsa('.kg-gallery-image > img').forEach(item => {
      const container = item.closest('.kg-gallery-image')
      const width = item.attributes.width.value
      const height = item.attributes.height.value
      const ratio = width / height
      container.style.flex = ratio + ' 1 0%'
    })

    // medium-zoom
    // -----------------------------------------------------------------------------
    rimay.qsa('.article-inner img').forEach(el => !el.closest('a') && el.classList.add('rimay-zoom'))

    mediumZoom('.rimay-zoom', {
      margin: 20,
      background: 'hsla(0,0%,100%,.85)'
    })

    // Instagram Feed
    // -----------------------------------------------------------------------------
    const instagramFeed = {
      token: '1397790551.1aa422d.37dca7d33ba34544941e111aa03e85c7',
      userId: '1397790551',
      userName: 'GodoFredoNinja'
    }

    const url = `https://api.instagram.com/v1/users/${instagramFeed.userId}/media/recent/?access_token=${instagramFeed.token}&count=10&callback=?`
    const user = `<a href="https://www.instagram.com/${instagramFeed.userName}" class="instagram-btn" target="_blank" rel="noopener noreferrer">@${instagramFeed.userName}</a>`

    window.innerWidth > 768 && instagram(url, user)

    // highlight prismjs
    // -----------------------------------------------------------------------------
    if (rimay.qsa('.article-inner pre').length) {
      loadScript(`${siteUrl}/assets/scripts/prismjs.js`)
    }
  } // End Finalize
}

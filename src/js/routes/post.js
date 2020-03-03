/* global prismJs */

import mediumZoom from 'medium-zoom'

import { loadScript } from '../app/app.load-style-script'
import copyLinkPost from '../app/app.copy-short-link-post'
import videoResponsive from '../app/app.video-responsive'
import galleryCard from '../app/app.gallery-card'
import stickyShare from '../app/app.sticky.share'

export default {
  init () {
    /* All Video Responsive
    /* ---------------------------------------------------------- */
    videoResponsive()
  },

  finalize () {
    /* Gallery Card
    /* ---------------------------------------------------------- */
    galleryCard()

    /* Copy the link of the post
    /* ---------------------------------------------------------- */
    copyLinkPost('#shortlink-input')

    /* medium-zoom
    /* ---------------------------------------------------------- */
    document.querySelectorAll('.article-inner img').forEach(el => !el.closest('a') && el.classList.add('rimay-zoom'))

    mediumZoom('.rimay-zoom', {
      margin: 20,
      background: 'hsla(0,0%,100%,.85)'
    })

    /* highlight prismjs
    /* ---------------------------------------------------------- */
    if (document.querySelectorAll('code[class*=language-]').length && typeof prismJs !== 'undefined') {
      loadScript(prismJs)
    }

    /* Sticky Share
    /* ---------------------------------------------------------- */
    stickyShare('.js-social-share')
  } // End Finalize
}

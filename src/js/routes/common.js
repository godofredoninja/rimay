/* global followSocialMedia siteSearch */

import { loadScript } from '../app/app.load-style-script'
import socialMedia from '../app/app.social-media'

export default {
  init () {
    /* Social Media Links
    /* ---------------------------------------------------------- */
    if (typeof followSocialMedia === 'object' && followSocialMedia !== null) {
      socialMedia(followSocialMedia)
    }
  }, // End Init

  finalize () {
    /* Toggle Menu
    /* ---------------------------------------------------------- */
    document.querySelector('.js-toggle-menu').addEventListener('click', e => {
      e.preventDefault()
      document.body.classList.toggle('has-menu')
    })

    /* Load Search
    /* ---------------------------------------------------------- */
    if (typeof searchSettings !== 'undefined' && typeof siteSearch !== 'undefined') {
      loadScript('https://unpkg.com/@tryghost/content-api@1.3.7/umd/content-api.min.js', () => {
        loadScript(siteSearch)
      })
    }

    // JavaScript to be fired on all pages, after page specific JS is fired
  } // End Finalize
}

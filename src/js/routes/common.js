/* global siteUrl searchKey */

import * as rimay from '../app/app.variables'
import { loadScript } from '../app/app.load-style-script'

export default {
  init () {
    // Toggle Menu
    // -----------------------------------------------------------------------------
    rimay.qs('.js-toggle-menu').addEventListener('click', e => {
      e.preventDefault()
      rimay.body.classList.toggle('has-menu')
    })
  }, // End Init

  finalize () {
    // Load Search
    // -----------------------------------------------------------------------------
    if (typeof searchKey !== 'undefined' || searchKey !== '') {
      loadScript('https://unpkg.com/@tryghost/content-api@1.2.5/umd/content-api.min.js', () => {
        loadScript(`${siteUrl}/assets/scripts/search.js`)
      })
    }

    // JavaScript to be fired on all pages, after page specific JS is fired
  } // End Finalize
}

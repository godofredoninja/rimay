/* global siteUrl */

// import external dependencies
import 'lazysizes'

// Impost
import { loadScript } from './app/app.load-style-script'

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
  }
}

window.addEventListener('load', setup)

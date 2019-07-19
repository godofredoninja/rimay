// import external dependencies

import 'lazysizes'

// Import everything from autoload
// import './autoload/**/*'

// import local dependencies
import Router from './util/Router'
import common from './routes/common'
import isArticle from './routes/post'
import isVideo from './routes/video'

/** Populate Router instance with DOM routes */
const routes = new Router({
  // All pages
  common,
  // article
  isArticle,
  // video post format
  isVideo
  // Audio post Format
  // isAudio,
  // Newsletter
  // isNewsletter,
})

// Load Events
window.addEventListener('load', routes.loadEvents(), false)

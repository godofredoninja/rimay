// import external dependencies
import 'lazysizes'

// import local dependencies
import Router from './util/Router'
import common from './routes/common'
import isArticle from './routes/post'
// import isVideo from './routes/video'

/** Populate Router instance with DOM routes */
const routes = new Router({
  // All Pages
  common,
  // Article page
  isArticle
  // Video page
  // isVideo
})

// Load Events
// document.addEventListener('DOMContentLoaded', routes.loadEvents(), false)
window.addEventListener('load', routes.loadEvents(), false)

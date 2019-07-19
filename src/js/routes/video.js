// Variables
import * as rimay from '../app/app.variables'

export default {
  init () {
    const postInner = rimay.qs('.article-inner')
    const videoMedia = rimay.qs('.js-video-media')
    const firstVideo = postInner.querySelectorAll(rimay.iframeVideo.join(','))[0]

    if (!firstVideo) return

    if (firstVideo.closest('.kg-embed-card')) {
      videoMedia.appendChild(firstVideo.closest('.kg-embed-card'))
    } else {
      videoMedia.appendChild(firstVideo.parentNode)
    }
  }
}

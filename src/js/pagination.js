(function (window, document) {
  const nextElement = document.querySelector('link[rel=next]')
  if (!nextElement) return

  const storyFeedContent = document.querySelector('.story-feed')
  if (!storyFeedContent) return

  let ticking = false

  // Button Load More
  const loadMoreButton = document.querySelector('.js-load-more')
  loadMoreButton.classList.remove('u-hide')

  function onPageLoad () {
    if (this.status === 404) {
      loadMoreButton.remove()

      return
    }

    // append Contents
    const postElements = this.response.querySelector('.story-feed-content')
    storyFeedContent.appendChild(postElements)

    // set next link
    const resNextElement = this.response.querySelector('link[rel=next]')
    if (resNextElement) {
      nextElement.href = resNextElement.href
    } else {
      loadMoreButton.remove()
    }

    // Sync status
    ticking = false
  }

  function onUpdate () {
    const xhr = new window.XMLHttpRequest()
    xhr.responseType = 'document'

    xhr.addEventListener('load', onPageLoad)

    xhr.open('GET', nextElement.href)
    xhr.send(null)
  }

  function requestTick (e) {
    e.preventDefault()

    ticking || window.requestAnimationFrame(onUpdate)
    ticking = true
  }

  // click button load more
  loadMoreButton.addEventListener('click', requestTick)
})(window, document)

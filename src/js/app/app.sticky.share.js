/* global requestAnimationFrame */

export default boxShare => {
  if (window.innerWidth < 1095) return

  const socialShare = document.querySelector(boxShare)

  if (!socialShare) return

  const articleFooter = document.querySelector('.article-footer')
  // const articleFooterOffsetTop = socialShare.parentNode.offsetTop

  let lastWindowHeight = window.innerHeight
  let lastScrollY = window.scrollY
  let ticking = false

  function onScroll () {
    lastScrollY = window.scrollY
    requestTick()
  }

  function onResize () {
    lastScrollY = window.scrollY
    lastWindowHeight = window.innerHeight

    requestTick()
  }

  function requestTick () {
    if (!ticking) {
      requestAnimationFrame(update)
    }

    ticking = true
  }

  function update () {
    const trigger = articleFooter.getBoundingClientRect().top - lastWindowHeight
    const triggerOffset = articleFooter.offsetHeight + 30

    // remove and add class (.share-open)
    lastScrollY > 120 ? socialShare.classList.remove('share-open') : socialShare.classList.add('share-open')

    // remove and add class (.share--fixwed)
    if (lastScrollY >= trigger - triggerOffset) {
      socialShare.classList.remove('share--fixed')
    } else {
      socialShare.classList.add('share--fixed')
    }

    ticking = false
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
}

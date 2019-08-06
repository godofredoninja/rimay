/* global siteUrl */

import mediumZoom from 'medium-zoom'

// Variables
import * as rimay from '../app/app.variables'
import { loadScript } from '../app/app.load-style-script'
// import instagram from '../app/app.instagram'
import facebookCommentsCount from '../app/app.facebook-comment-count'

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

    // Facebook Comments Count
    // -----------------------------------------------------------------------------
    // const facebookAppId = '344388876498138'
    // const facebookAppSecretKey = 'f19d6496fe2394dfc1915a53a6fe2388'
    // const articleUrl = window.location.href
    // const urlEncode = `https://graph.facebook.com/?id=${encodeURIComponent(articleUrl)}&fields=engagement&access_token=${facebookAppId}|${facebookAppSecretKey}`

    // const facebookCommentsBox = rimay.qs('.js-comments-count')

    // facebookCommentsBox && facebookCommentsCount(urlEncode, facebookCommentsBox)

    // Instagram Feed
    // -----------------------------------------------------------------------------
    // const instagramFeed = {
    //   token: '1397790551.1aa422d.37dca7d33ba34544941e111aa03e85c7',
    //   userId: '1397790551',
    //   userName: 'GodoFredoNinja'
    // }

    // const url = `https://api.instagram.com/v1/users/${instagramFeed.userId}/media/recent/?access_token=${instagramFeed.token}&count=10&callback=?`
    // const user = `<a href="https://www.instagram.com/${instagramFeed.userName}" class="instagram-btn" target="_blank" rel="noopener noreferrer">@${instagramFeed.userName}</a>`

    // if (window.innerWidth > 768 && rimay.qs('.instagram')) {
    //   instagram(url, user)
    // }

    // highlight prismjs
    // -----------------------------------------------------------------------------
    if (rimay.qsa('.article-inner pre').length) {
      loadScript(`${siteUrl}/assets/scripts/prismjs.js`)
    }

    // Facebook Comments Load
    // -----------------------------------------------------------------------------
    // rimay.qsa('.js-comments-toggle').forEach(item => item.addEventListener('click', e => {
    //   e.preventDefault()
    //   rimay.body.classList.toggle('has-comments')

    //   if (document.getElementById('facebook-jssdk')) return
    //   let jsf = document.createElement('script')
    //   jsf.id = 'facebook-jssdk'
    //   jsf.src = 'https://connect.facebook.net/es_ES/sdk.js#xfbml=1&version=v3.3'
    //   jsf.defer = true
    //   jsf.async = true
    //   rimay.body.appendChild(jsf)
    // }))

    // URL Copy link
    // -----------------------------------------------------------------------------
    const copyThis = document.getElementById('shortlink')
    const shortLink = rimay.qs('.shortlink')
    const shortLinkIndicator = rimay.qs('.shortlink-indicator')

    if (shortLink) {
      shortLink.addEventListener('click', function (e) {
        e.preventDefault()
        copyThis.select()
        document.execCommand('copy')
        this.classList.add('active')
        shortLinkIndicator.textContent = 'Copied!'
        copyThis.focus()
      })

      copyThis.addEventListener('focusout', e => {
        e.preventDefault()
        shortLink.classList.remove('active')
        shortLinkIndicator.textContent = 'copy'
      })
    }

    // Windows Scroll
    // -----------------------------------------------------------------------------
    const socialShare = rimay.qs('.js-social-share')
    let articleFooterOffsetTop = 0

    if (socialShare) articleFooterOffsetTop = socialShare.parentNode.offsetTop

    // const articleFooterOffsetTop = rimay.qs('.article-footer').offsetTop

    const buffer = 300
    let lastScrollY = 0
    let lastWindowHeight = window.innerHeight

    function myAllScroll () {
      // remove and add class (.share-open) social share
      lastScrollY > 120 ? socialShare.classList.remove('share-open') : socialShare.classList.add('share-open')

      // remove and add class (.share--fixwed) social share
      if (lastScrollY > articleFooterOffsetTop - lastWindowHeight - buffer) {
        socialShare.classList.remove('share--fixed')
      } else {
        socialShare.classList.add('share--fixed')
      }
    }

    function myScroll () {
      lastScrollY = window.scrollY
      myAllScroll()
    }

    // function onResize () {
    //   lastScrollY = window.scrollY
    //   lastWindowHeight = window.innerHeight

    //   myAllScroll()
    // }

    if (window.innerWidth > 1095 && socialShare) {
      window.addEventListener('scroll', myScroll, { passive: true })
      // window.addEventListener('resize', onResize)
    }
  } // End Finalize
}

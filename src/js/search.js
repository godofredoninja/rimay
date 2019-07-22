/* global searchKey */
import GhostSearch from './app/app.search'
// import { loadScript } from './app/app.load-style-script'

((window, document) => {
  // ApiKey Search
  // if (typeof searchKey === 'undefined' || searchKey === '') return

  const qs = document.querySelector.bind(document)
  const qsa = document.querySelectorAll.bind(document)

  const searchInput = document.getElementById('search-field')
  const searchResults = qs('#searchResults')
  const searchMessage = qs('.js-search-message')

  let searchResultsHeight = {
    outer: 0,
    scroll: 0
  }

  // Load Ghost Api
  // -----------------------------------------------------------------------------
  // loadScript('https://unpkg.com/@tryghost/content-api@1.2.5/umd/content-api.min.js')

  // Variable for search
  // -----------------------------------------------------------------------------
  const mySearchSettings = {
    url: window.location.origin,
    // url: 'http://localhost:2368',
    key: searchKey,
    input: '#search-field',
    results: '#searchResults',
    on: {
      afterDisplay: () => {
        searchResultActive()
        searchResultsHeight = {
          outer: searchResults.offsetHeight,
          scroll: searchResults.scrollHeight
        }
      }
    }
  }

  // when the Enter key is pressed
  // -----------------------------------------------------------------------------
  function enterKey () {
    const link = searchResults.querySelector('a.search-result--active')
    link && link.click()
  }

  // Attending the active class to the search link
  // -----------------------------------------------------------------------------
  function searchResultActive (t, e) {
    t = t || 0
    e = e || 'up'

    // if (window.innerWidth < 768) return

    const searchLInk = searchResults.querySelectorAll('a')

    if (!searchLInk.length) {
      searchInput.value.length && searchMessage.classList.remove('u-hide')
      return
    }

    searchMessage.classList.add('u-hide')

    const searchLinkActive = searchResults.querySelector('a.search-result--active')
    searchLinkActive && searchLinkActive.classList.remove('search-result--active')

    searchLInk[t].classList.add('search-result--active')

    let n = searchLInk[t].offsetTop
    let o = 0

    e === 'down' && n > searchResultsHeight.outer / 2 ? o = n - searchResultsHeight.outer / 2 : e === 'up' && (o = n < searchResultsHeight.scroll - searchResultsHeight.outer / 2 ? n - searchResultsHeight.outer / 2 : searchResultsHeight.scroll)

    searchResults.scrollTo(0, o)
  }

  // Clear Input for write new letters
  // -----------------------------------------------------------------------------
  function clearInput () {
    searchInput.focus()
    searchInput.setSelectionRange(0, searchInput.value.length)
  }

  // Search close with Key
  // -----------------------------------------------------------------------------
  function searchClose () {
    document.body.classList.remove('has-search')
    document.removeEventListener('keyup', mySearchKey)
  }

  // Reacted to the up or down keys
  // -----------------------------------------------------------------------------
  function arrowKeyUpDown (keyNumber) {
    let e
    let indexTheLink = 0

    const resultActive = searchResults.querySelectorAll('.search-result--active')[0]
    if (resultActive) {
      indexTheLink = [].slice.call(resultActive.parentNode.children).indexOf(resultActive)
    }

    searchInput.blur()

    if (keyNumber === 38) {
      e = 'up'
      if (indexTheLink <= 0) {
        searchInput.focus()
        indexTheLink = 0
      } else {
        indexTheLink -= 1
      }
    } else {
      e = 'down'
      if (indexTheLink >= searchResults.querySelectorAll('a').length - 1) {
        indexTheLink = searchResults.querySelectorAll('a').length - 1
      } else {
        indexTheLink = indexTheLink + 1
      }
    }

    searchResultActive(indexTheLink, e)
  }

  // Adding functions to the keys
  // -----------------------------------------------------------------------------
  function mySearchKey (e) {
    e.preventDefault()

    let keyNumber = e.keyCode

    /**
      * 38 => Top / Arriba
      * 40 => down / abajo
      * 27 => escape
      * 13 => enter
      * 191 => /
      **/

    if (keyNumber === 27) {
      searchClose()
    } else if (keyNumber === 13) {
      searchInput.blur()
      enterKey()
    } else if (keyNumber === 38 || keyNumber === 40) {
      arrowKeyUpDown(keyNumber)
    } else if (keyNumber === 191) {
      clearInput()
    }
  }

  // Open Search
  // -----------------------------------------------------------------------------
  qsa('.js-open-search').forEach(item => item.addEventListener('click', e => {
    e.preventDefault()
    searchInput.focus()
    document.body.classList.add('has-search')
    document.addEventListener('keyup', mySearchKey)
  }))

  // Close Search
  // -----------------------------------------------------------------------------
  qsa('.js-close-search').forEach(item => item.addEventListener('click', e => {
    e.preventDefault()
    document.body.classList.remove('has-search')
    document.removeEventListener('keyup', mySearchKey)
  }))

  // Search
  // -----------------------------------------------------------------------------
  /* eslint-disable no-new */
  new GhostSearch(mySearchSettings)
})(window, document)

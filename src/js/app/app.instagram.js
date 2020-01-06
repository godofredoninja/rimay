// user id => 1397790551
// token => 1397790551.1aa422d.37dca7d33ba34544941e111aa03e85c7
// user nname => GodoFredoNinja
// http://instagram.com/oauth/authorize/?client_id=YOURCLIENTIDHERE&redirect_uri=HTTP://YOURREDIRECTURLHERE.COM&response_type=token

import fetchQuote from '../app/app.fetch'

const iconHeart = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M352 56h-1c-39.7 0-74.8 21-95 52-20.2-31-55.3-52-95-52h-1c-61.9.6-112 50.9-112 113 0 37 16.2 89.5 47.8 132.7C156 384 256 456 256 456s100-72 160.2-154.3C447.8 258.5 464 206 464 169c0-62.1-50.1-112.4-112-113z"/></svg>'
const iconComments = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'

/* Template for images */
const templateInstagram = data => {
  return `<div class="instagram-col">
    <a href="${data.link}" class="instagram-img u-relative u-block" target="_blank" rel="noopener noreferrer">
      <img class="u-absolute u-image u-block lazyload" data-src="${data.images.standard_resolution.url}"/>
      <div class="instagram-hover u-absolute0 u-flexColumnCenter zindex3">
        <div class="u-textAlignCenter u-fontWeightSemibold u-fontSize20">
          <span style="padding-right:10px"><span class="icon icon--white">${iconHeart}</span> ${data.likes.count}</span>
          <span style="padding-left:10px"><span class="icon icon--white">${iconComments}</span> ${data.comments.count}</span>
        </div>
      </div>
    </a>
  </div>`
}

// Shuffle Array
const shuffleInstagram = arr => arr
  .map(a => [Math.random(), a])
  .sort((a, b) => a[0] - b[0])
  .map(a => a[1])

// Display Instagram Images
const displayInstagram = (res, user) => {
  const shuffle = shuffleInstagram(res.data)
  const sf = shuffle.slice(0, 6)

  const box = document.querySelector('.instagram-wrap')
  document.querySelector('.instagram-name').innerHTML = user

  sf.map(img => {
    const images = templateInstagram(img)
    box.innerHTML += images
  })
}

export default async (url, user) => {
  try {
    const result = await fetchQuote(url)
    displayInstagram(result, user)
  } catch (err) {
    document.querySelector('.instagram').remove()
  }
  // Fetch
  // fetch(url)
  // .then(response => response.json())
  // .then(resource => displayInstagram(resource, user))
  // .catch( () => document.querySelector('.instagram').remove())
}

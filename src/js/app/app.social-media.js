export default socialMedia => {
  const urlRegexp = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \+\.-]*)*\/?$/ //eslint-disable-line

  const createElement = box => {
    Object.entries(socialMedia).forEach(([name, urlTitle]) => {
      if (typeof urlTitle[0] === 'string' && urlRegexp.test(urlTitle[0])) {
        const link = document.createElement('a')
        link.classList = 'social-media-link'
        link.href = urlTitle[0]
        link.title = urlTitle[1]
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.innerHTML = `<svg class="icon icon--${name}"><use xlink:href="#icon-${name}"></use></svg> ${name}`

        const parentLink = document.createElement('li')
        parentLink.appendChild(link)

        box.appendChild(parentLink)
      }
    })
  }

  document.querySelectorAll('.js-social-media').forEach(el => createElement(el))
}

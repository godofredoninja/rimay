export function loadStyle (href) {
  let linkElement = document.createElement('link')
  linkElement.rel = 'stylesheet'
  linkElement.href = href
  document.head.appendChild(linkElement)
}

export function loadScript (src, callback) {
  let scriptElement = document.createElement('script')
  scriptElement.src = src
  scriptElement.defer = true
  scriptElement.async = true

  callback && scriptElement.addEventListener('load', callback)
  document.body.appendChild(scriptElement)
}

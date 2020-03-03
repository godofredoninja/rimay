export default link => {
  const copyThis = document.querySelector(link)

  // return if it does not exist to copy the links
  if (!copyThis) return

  const shortlinkBox = document.querySelector('#shortlink')
  const shortLinkIndicator = document.querySelector('.shortlink-indicator')
  const shortLinkCopy = document.querySelectorAll('.js-short-link')

  // Copy the link when clicked
  shortLinkCopy.forEach(item => item.addEventListener('click', function (e) {
    e.preventDefault()

    copyThis.select()
    document.execCommand('copy')
    shortlinkBox.classList.add('active')
    shortLinkIndicator.textContent = 'Copied!'
    copyThis.focus()
  }))

  // removing when are activate the link copy
  copyThis.addEventListener('focusout', e => {
    e.preventDefault()
    shortlinkBox.classList.remove('active')
    shortLinkIndicator.textContent = 'copy'
  })
}

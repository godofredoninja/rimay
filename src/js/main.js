// import external dependencies
import 'lazysizes'

const setup = () => {
  const qs = document.querySelector.bind(document)
  const qsa = document.querySelectorAll.bind(document)

  const body = qs('body')

  console.log(body)
}

window.addEventListener('load', setup)

// Variables
import * as rimay from '../app/app.variables'

export default {
  init () {
    // Toggle Menu
    // -----------------------------------------------------------------------------
    rimay.qs('.js-toggle-menu').addEventListener('click', e => {
      e.preventDefault()
      rimay.body.classList.toggle('has-menu')
    })
  }, // End Init

  finalize () {
    console.log('hola segundo')
    // JavaScript to be fired on all pages, after page specific JS is fired
  } // End Finalize
}

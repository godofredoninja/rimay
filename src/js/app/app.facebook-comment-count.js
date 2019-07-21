// App ID  => 344388876498138
// App Secret => f19d6496fe2394dfc1915a53a6fe2388

// Fetch
import fetchQuote from '../app/app.fetch'

export default async (url, box) => {
  try {
    const result = await fetchQuote(url)
    box.innerHTML = `(${result.engagement.comment_count})`
  } catch (err) {
    box.remove()
  }
}

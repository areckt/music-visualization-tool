export function generateCodeVerifier(length) {
  let text = ''
  let possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const formattedMinutes = minutes.toString().padStart(1, '0')
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0')
  return `${formattedMinutes}:${formattedSeconds}`
}

export function toggleTheme() {
  const root = document.documentElement
  const theme = root.getAttribute('data-theme')
  const newTheme = theme === 'light' ? 'dark' : 'light'
  root.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
}

export function logout() {
  localStorage.removeItem('verifier')
  localStorage.removeItem('accessToken')
  window.location = '/'
}

export function mapTracks(tracks) {
  const mappedTracks = tracks.map((track) => {
    const albumImage = track.album.images.reduce((img300, image) => {
      if (image.height == 300) return image
      return img300
    }, track.album.images[0])

    const duration = formatDuration(track.duration_ms)
    const artists = track.artists.map((artist) => artist.name).join(', ')

    return {
      ...track,
      artists: artists,
      image: albumImage.url,
      duration: duration,
    }
  })
  return mappedTracks
}

// Simple implementation of lodash.cloneDeep
// Does not clone functions or handle recursive references.
export function cloneDeep(original) {
  if (original instanceof RegExp) {
    return new RegExp(original)
  } else if (original instanceof Date) {
    return new Date(original.getTime())
  } else if (Array.isArray(original)) {
    return original.map(cloneDeep)
  } else if (typeof original === 'object' && original !== null) {
    const clone = {}
    Object.keys(original).forEach((k) => {
      clone[k] = cloneDeep(original[k])
    })
    return clone
  }
  return original
}

export function debounce(fn, ms) {
  let timer
  return (_) => {
    clearTimeout(timer)
    timer = setTimeout((_) => {
      timer = null
      fn.apply(this, arguments)
    }, ms)
  }
}

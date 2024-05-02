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
  root.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light')
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
      artist: artists,
      title: track.name,
      id: track.id,
      image: albumImage.url,
      durationMs: track.duration_ms,
      duration: duration,
    }
  })
  return mappedTracks
}

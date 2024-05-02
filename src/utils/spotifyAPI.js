import { generateCodeVerifier, generateCodeChallenge } from './utils'

const clientId = 'c1daea0e75e94a118efba6aad50a9177'

export async function redirectToAuthCodeFlow() {
  const verifier = generateCodeVerifier(128)
  const challenge = await generateCodeChallenge(verifier)

  localStorage.setItem('verifier', verifier)

  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('response_type', 'code')
  params.append('redirect_uri', 'http://localhost:5173/callback')
  params.append('scope', 'user-read-private user-read-email user-top-read')
  params.append('code_challenge_method', 'S256')
  params.append('code_challenge', challenge)

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function getAccessToken(code) {
  const verifier = localStorage.getItem('verifier')

  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('grant_type', 'authorization_code')
  params.append('code', code)
  params.append('redirect_uri', 'http://localhost:5173/callback')
  params.append('code_verifier', verifier)

  try {
    const result = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    if (result.status !== 200) {
      localStorage.removeItem('verifier')
      throw new Error('Failed to fetch access token')
    }
    const { access_token } = await result.json()
    return access_token
  } catch (error) {
    console.error(error)
    window.location = '/'
  }
}

export async function fetchProfile(token) {
  try {
    const result = await fetch('https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (result.status !== 200) {
      localStorage.removeItem('accessToken')
      throw new Error('Failed to fetch profile')
    }
    return await result.json()
  } catch (error) {
    console.error(error)
    window.location = '/'
  }
}

export async function fetchTracks(token, searchQuery) {
  try {
    const result = await fetch(
      `https://api.spotify.com/v1/search?q=${searchQuery}&type=track`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    if (result.status !== 200) {
      localStorage.removeItem('accessToken')
      throw new Error('Failed to fetch tracks')
    }
    return await result.json()
  } catch (error) {
    console.error(error)
    window.location = '/'
  }
}

export async function fetchUserTopTracks(token) {
  try {
    const result = await fetch('https://api.spotify.com/v1/me/top/tracks', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (result.status !== 200) {
      localStorage.removeItem('accessToken')
      throw new Error("Failed to fetch user's top tracks")
    }
    return await result.json()
  } catch (error) {
    console.error(error)
    window.location = '/'
  }
}

export async function fetchTrackAudioFeatures(token, trackId) {
  try {
    const result = await fetch(
      `https://api.spotify.com/v1/audio-features/${trackId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    if (result.status !== 200) {
      localStorage.removeItem('accessToken')
      throw new Error("Failed to fetch track's audio features")
    }
    return await result.json()
  } catch (error) {
    console.error(error)
    window.location = '/'
  }
}

export async function fetchTrackAudioAnalysis(token, trackId) {
  try {
    const result = await fetch(
      `https://api.spotify.com/v1/audio-analysis/${trackId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    if (result.status !== 200) {
      localStorage.removeItem('accessToken')
      throw new Error("Failed to fetch track's audio analysis")
    }
    return await result.json()
  } catch (error) {
    console.error(error)
    window.location = '/'
  }
}

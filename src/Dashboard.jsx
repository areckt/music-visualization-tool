import { useState, useEffect } from 'react'
import { getAccessToken, fetchProfile } from './spotifyAPI'
import Profile from './Profile'
import TrackSearch from './TrackSearch'

function Dashboard({ code }) {
  const [accessToken, setAccessToken] = useState()
  const [profile, setProfile] = useState()

  useEffect(() => {
    ;(async () => {
      let accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        accessToken = await getAccessToken(code)
        localStorage.setItem('accessToken', accessToken)
      }
      setAccessToken(accessToken)

      const profile = await fetchProfile(accessToken)
      setProfile(profile)
      window.history.pushState({}, null, '/')
    })()
  }, [code])

  return (
    <>
      <h1>Display your Spotify profile data</h1>
      {profile ? <Profile profile={profile} /> : <p>Loading...</p>}
      {profile && <TrackSearch />}
    </>
  )
}
export default Dashboard

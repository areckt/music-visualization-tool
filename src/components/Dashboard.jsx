import { useState, useEffect, useRef } from 'react'
// import { getAccessToken, fetchProfile } from '../utils/spotifyAPI'
import Profile from './Profile'
import TrackSearch from './TrackSearch'
import { useGlobalContext } from '../context'
import MainContent from './MainContent'
// import SpotifyPlayer from './SpotifyPlayer'
import AudioPlayer from './AudioPlayer'

const AUDIO = {
  toto: 'public/audio/toto-africa.mp3',
  arcticMonkeys: 'public/audio/arctic-monkeys-i-wanna-be-yours.mp3',
  sabrina: 'public/audio/sabrina-carpenter-espresso.mp3',
  rick: 'public/audio/rick.mp3',
  queen: 'public/audio/queen-bohemian-rhapsody.mp3',
  gangnam: 'public/audio/gangnam-style.mp3',
  zacznij: 'public/audio/zacznij-od-bacha.mp3',
  tempest: 'public/audio/the-tempest.mp3',
}

function Dashboard() {
  const { selectedTrackId } = useGlobalContext()
  const audioPlayerRef = useRef(null)
  // const [accessToken, setAccessToken] = useState()
  // const [profile, setProfile] = useState()
  // const { selectedTrackId } = useGlobalContext()

  // useEffect(() => {
  //   ;(async () => {
  //     let accessToken = localStorage.getItem('accessToken')
  //     if (!accessToken) {
  //       accessToken = await getAccessToken(code)
  //       localStorage.setItem('accessToken', accessToken)
  //     }
  //     setAccessToken(accessToken)

  //     const profile = await fetchProfile(accessToken)
  //     setProfile(profile)
  //     // window.history.pushState({}, null, '/')
  //   })()
  // }, [code])

  return (
    <>
      <header className="container">
        <Profile />
        <TrackSearch />
      </header>
      <MainContent audioPlayerRef={audioPlayerRef} />
      {selectedTrackId && (
        <AudioPlayer ref={audioPlayerRef} src={AUDIO[selectedTrackId]} />
      )}
    </>
  )
}
export default Dashboard

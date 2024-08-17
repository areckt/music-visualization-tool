import styled from 'styled-components'
import SpotifyWebPlayer, { spotifyApi } from 'react-spotify-web-playback'
import { useEffect, useState, useRef } from 'react'
import { useGlobalContext } from '../context'

const SpotifyPlayer = ({ token, trackId }) => {
  const { seeker, setSeeker } = useGlobalContext()
  const interval = useRef(null)
  const [uris, setUris] = useState('')

  const onUpdate = (state) => {
    setSeeker(state.progressMs)
    console.log('playback state: ', state)
    clearInterval(interval.current)
    if (state.isPlaying) {
      interval.current = setInterval(() => {
        setSeeker((v) => v + 50)
      }, 50)
    }
  }

  useEffect(() => {
    spotifyApi.seek(token, 0)
    setSeeker(0)
    setUris(`spotify:track:${trackId}`)
  }, [trackId])

  return (
    <SpotifyPlayerStyled className="container">
      <SpotifyWebPlayer
        token={token}
        uris={uris}
        callback={onUpdate}
        layout="compact"
        hideCoverArt
        hideAttribution
      />
    </SpotifyPlayerStyled>
  )
}
export default SpotifyPlayer

const SpotifyPlayerStyled = styled.div`
  position: fixed;
  z-index: 999;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  box-shadow: 0 -2px 10px -2px rgba(0, 0, 0, 0.2);
`

import styled from 'styled-components'
import SpotifyWebPlayer, { spotifyApi } from 'react-spotify-web-playback'
import { useRef } from 'react'
import { useGlobalContext } from '../context'

const SpotifyPlayer = ({ token, trackId }) => {
  const { seeker, setSeeker } = useGlobalContext()
  const interval = useRef(null)

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

  return (
    <SpotifyPlayerStyled className="container">
      <SpotifyWebPlayer
        token={token}
        uris={`spotify:track:${trackId}`}
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
  border-top: 1px solid black;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
`

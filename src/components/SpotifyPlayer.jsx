import styled from 'styled-components'
import SpotifyWebPlayer, { spotifyApi } from 'react-spotify-web-playback'
import { useEffect, useState, useRef } from 'react'
import { useGlobalContext } from '../context'

const SpotifyPlayer = ({ token, trackId }) => {
  const { setSeeker } = useGlobalContext()
  const interval = useRef(null)
  const pingInterval = useRef(null)
  const [uris, setUris] = useState('')

  const onUpdate = (state) => {
    setSeeker(state.progressMs)

    clearInterval(interval.current)
    clearInterval(pingInterval.current)

    if (state.isPlaying && state?.track?.id === trackId) {
      interval.current = setInterval(() => {
        setSeeker((v) => v + 50)
      }, 49)

      pingInterval.current = setInterval(() => {
        spotifyApi.getPlaybackState(token).then((res) => {
          if (!res || !res.progress_ms) {
            return
          }
          setSeeker((v) => {
            if (Math.abs(v - res.progress_ms) <= 1000) {
              return res.progress_ms
            } else {
              return v - 100
            }
          })
        })
      }, 250)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      clearInterval(interval.current)
      clearInterval(pingInterval.current)
      setSeeker(0)
    }, 1000)
    setUris(`spotify:track:${trackId}`)
    return () => {
      clearInterval(interval.current)
      clearInterval(pingInterval.current)
    }
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
        styles={{ color: '#0172ad' }}
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

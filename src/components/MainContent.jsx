import { useEffect, useState } from 'react'
import { useGlobalContext } from '../context'
import {
  fetchTrackAudioAnalysis,
  fetchTrackAudioFeatures,
} from '../utils/spotifyAPI'
import Track from '../utils/Track'

const MainContent = () => {
  const {
    selectedTrackId,
    trackData,
    setTrackAudioFeatures,
    setTrackAudioAnalysis,
  } = useGlobalContext()

  const [track, setTrack] = useState()

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    ;(async () => {
      const trackAudioFeatures = await fetchTrackAudioFeatures(
        accessToken,
        selectedTrackId
      )
      setTrackAudioFeatures(trackAudioFeatures)
      console.log('Audio Features: ', trackAudioFeatures)

      const trackAudioAnalysis = await fetchTrackAudioAnalysis(
        accessToken,
        selectedTrackId
      )
      setTrackAudioAnalysis(trackAudioAnalysis)
      console.log('Audio Analysis: ', trackAudioAnalysis)

      const track = new Track(trackData, trackAudioAnalysis)
      setTrack(track)
    })()

    return () => {
      setTrackAudioFeatures(null)
      setTrackAudioAnalysis(null)
      setTrack(null)
    }
  }, [selectedTrackId])

  return (
    <main className="container">
      <article>
        <h3>MainContent</h3>
        <p>TODO: visualizations</p>
      </article>
    </main>
  )
}
export default MainContent

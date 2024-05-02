import { useEffect } from 'react'
import { useGlobalContext } from '../context'
import {
  fetchTrackAudioAnalysis,
  fetchTrackAudioFeatures,
} from '../utils/spotifyAPI'

const MainContent = () => {
  const { selectedTrackId, setTrackAudioFeatures, setTrackAudioAnalysis } =
    useGlobalContext()

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
    })()
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

import { useEffect, useState, useRef } from 'react'
import { useGlobalContext } from '../context'
import Structure from './visualizations/Structure'
import {
  fetchTrackAudioAnalysis,
  fetchTrackAudioFeatures,
} from '../utils/spotifyAPI'
import Track from '../utils/Track'
import { debounce } from '../utils/utils'

const MainContent = () => {
  const {
    selectedTrackId,
    trackData,
    setTrackAudioFeatures,
    setTrackAudioAnalysis,
    trackObject,
    setTrackObject,
    structure,
    setStructure,
  } = useGlobalContext()

  const headerRef = useRef(null)
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    setWidth(headerRef.current.getBoundingClientRect().width)

    const debouncedHandleResize = debounce(function handleResize() {
      setWidth(headerRef.current.getBoundingClientRect().width)
    }, 500)

    window.addEventListener('resize', debouncedHandleResize)

    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  }, [])

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

      const track = new Track(trackData, trackAudioAnalysis, setStructure)
      setTrackObject(track)
    })()

    return () => {
      setTrackAudioFeatures(null)
      setTrackAudioAnalysis(null)
      setTrackObject(null)
    }
  }, [selectedTrackId])

  return (
    <main className="container">
      <article>
        <h3 ref={headerRef}>Visualizations</h3>
        {trackObject && structure && (
          <Structure structure={structure} width={width} />
        )}
      </article>
    </main>
  )
}

export default MainContent

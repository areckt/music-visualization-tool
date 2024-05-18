import { useEffect, useState, useRef } from 'react'
import { useGlobalContext } from '../context'
import HarmonicStructure from './visualizations/HarmonicStructure'
import {
  fetchTrackAudioAnalysis,
  fetchTrackAudioFeatures,
} from '../utils/spotifyAPI'
import Track from '../utils/Track'
import { debounce } from '../utils/utils'
import TimbreStructure from './visualizations/TimbreStructure'
import Chords from './visualizations/Chords'

const MainContent = () => {
  const {
    selectedTrackId,
    trackData,
    setTrackAudioFeatures,
    setTrackAudioAnalysis,
    trackObject,
    setTrackObject,
    harmonicStructure,
    setHarmonicStructure,
    timbreStructure,
    setTimbreStructure,
    chordsFeatures,
    setChordsFeatures,
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

      const track = new Track(
        trackData,
        trackAudioAnalysis,
        setHarmonicStructure,
        setTimbreStructure,
        setChordsFeatures
      )
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
        {trackObject && harmonicStructure && (
          <HarmonicStructure structure={harmonicStructure} width={width} />
        )}
        {trackObject && timbreStructure && (
          <TimbreStructure structure={timbreStructure} width={width} />
        )}
        {trackObject && chordsFeatures && (
          <Chords chords={chordsFeatures.chords} width={width} />
        )}
      </article>
    </main>
  )
}

export default MainContent

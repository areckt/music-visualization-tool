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
import Tonality from './visualizations/Tonality'
import SkeletonLoading from './SkeletonLoading'
import styled from 'styled-components'

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
    harmonicStructureLoading,
    setHarmonicStructureLoading,
    timbreStructureLoading,
    setTimbreStructureLoading,
    chordsFeaturesLoading,
    setChordsFeaturesLoading,
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
        setChordsFeatures,
        setHarmonicStructureLoading,
        setTimbreStructureLoading,
        setChordsFeaturesLoading
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
    <MainContentStyled className="container">
      <article>
        <h3 ref={headerRef}>Visualizations</h3>

        {harmonicStructureLoading && <SkeletonLoading title="Structure" />}
        {!harmonicStructureLoading && trackObject && harmonicStructure && (
          <HarmonicStructure structure={harmonicStructure} width={width} />
        )}

        {timbreStructureLoading && <SkeletonLoading title="Timbre" />}
        {!timbreStructureLoading && trackObject && timbreStructure && (
          <TimbreStructure structure={timbreStructure} width={width} />
        )}

        {chordsFeaturesLoading && <SkeletonLoading title="Chords" />}
        {!chordsFeaturesLoading && trackObject && chordsFeatures && (
          <Chords chords={chordsFeatures.chords} width={width} />
        )}

        {chordsFeaturesLoading && <SkeletonLoading title="Tonality" />}
        {!chordsFeaturesLoading && trackObject && chordsFeatures && (
          <Tonality
            tonality={chordsFeatures.tonalityFeatureSmall}
            tonalitySlow={chordsFeatures.tonalityFeatureLarge}
            keyFeature={chordsFeatures.keyFeature}
            width={width}
          />
        )}
      </article>
    </MainContentStyled>
  )
}

const MainContentStyled = styled.main`
  article {
    min-height: calc(4 * 200px);
  }
`

export default MainContent

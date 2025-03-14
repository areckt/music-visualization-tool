import { useEffect, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import AudioFeaturesCharts from './visualizations/AudioFeaturesCharts'
import LoudnessGraph from './visualizations/LoudnessGraph'
import TempoGraph from './visualizations/TempoGraph'
import totoAnalysis from '../audioAnalysisData/TOTO-Africa.json'
import arcticMonkeysAnalysis from '../audioAnalysisData/ArcticMonkeys-IWannaBeYours.json'
import sabrinaAnalysis from '../audioAnalysisData/SabrinaCarpenter-Espresso.json'
import rickAnalysis from '../audioAnalysisData/RickAstley-NeverGonnaGiveYouUp.json'
import queenAnalysis from '../audioAnalysisData/Queen-BohemianRhapsody.json'
import gangnamAnalysis from '../audioAnalysisData/PSY-GangnamStyle.json'
import zacznijAnalysis from '../audioAnalysisData/zacznij-od-bacha.json'
import tempestAnalysis from '../audioAnalysisData/pendulum-tempest.json'

const AUDIO_FEATURES = {
  toto: {
    danceability: 0.67,
    energy: 0.37,
    loudness: -18,
    tempo: 93,
    valence: 0.73,
  },
  arcticMonkeys: {
    danceability: 0.27,
    energy: 0.12,
    loudness: -12,
    tempo: 67,
    valence: 0.45,
  },
  sabrina: {
    danceability: 0.82,
    energy: 0.79,
    loudness: -7,
    tempo: 104,
    valence: 0.68,
  },
  rick: {
    danceability: 0.72,
    energy: 0.94,
    loudness: -12,
    tempo: 113,
    valence: 0.91,
  },
  queen: {
    danceability: 0.4,
    energy: 0.39,
    loudness: -10,
    tempo: 144,
    valence: 0.21,
  },
  gangnam: {
    danceability: 0.73,
    energy: 0.94,
    loudness: -3,
    tempo: 132,
    valence: 0.76,
  },
  zacznij: {
    danceability: 0.39,
    energy: 0.6,
    loudness: -8,
    tempo: 103,
    valence: 0.58,
  },
  tempest: {
    danceability: 0.4,
    energy: 0.75,
    loudness: -8,
    tempo: 174,
    valence: 0.3,
  },
}

const AUDIO_ANALYSIS = {
  toto: totoAnalysis,
  arcticMonkeys: arcticMonkeysAnalysis,
  sabrina: sabrinaAnalysis,
  rick: rickAnalysis,
  queen: queenAnalysis,
  gangnam: gangnamAnalysis,
  zacznij: zacznijAnalysis,
  tempest: tempestAnalysis,
}

const MainContent = ({ audioPlayerRef }) => {
  const {
    selectedTrackId,
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
  const [audioFeatures, setAudioFeatures] = useState(null)
  const [audioAnalysis, setAudioAnalysis] = useState(null)

  // loading states
  const [harmonicStructureLoading, setHarmonicStructureLoading] =
    useState(false)
  const [timbreStructureLoading, setTimbreStructureLoading] = useState(false)
  const [chordsFeaturesLoading, setChordsFeaturesLoading] = useState(false)

  // handle window resize
  useEffect(() => {
    setWidth(headerRef.current.getBoundingClientRect().width)

    const debouncedHandleResize = debounce(function handleResize() {
      setWidth(headerRef.current.getBoundingClientRect().width)
    }, 250)

    window.addEventListener('resize', debouncedHandleResize)

    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  }, [])

  // const accessToken = localStorage.getItem('accessToken')

  // const { data: trackAudioFeatures, isLoading: isFeaturesLoading } = useQuery({
  //   queryKey: ['trackAudioFeatures', selectedTrackId],
  //   queryFn: () => fetchTrackAudioFeatures(accessToken, selectedTrackId),
  // })

  // const { data: trackAudioAnalysis, isLoading: isAnalysisLoading } = useQuery({
  //   queryKey: ['trackAudioAnalysis', selectedTrackId],
  //   queryFn: () => fetchTrackAudioAnalysis(accessToken, selectedTrackId),
  // })

  useEffect(() => {
    if (selectedTrackId) {
      setAudioFeatures(AUDIO_FEATURES[selectedTrackId])
      setAudioAnalysis(AUDIO_ANALYSIS[selectedTrackId])
    }
  }, [selectedTrackId])

  useEffect(() => {
    if (audioAnalysis) {
      const track = new Track(
        audioAnalysis.analysis,
        setHarmonicStructure,
        setTimbreStructure,
        setChordsFeatures,
        setHarmonicStructureLoading,
        setTimbreStructureLoading,
        setChordsFeaturesLoading
      )
      setTrackObject(track)
    }
  }, [audioAnalysis])

  return (
    <MainContentStyled className="container">
      <article>
        <h3 ref={headerRef}>Visualizations</h3>

        {audioFeatures && <AudioFeaturesCharts audioFeatures={audioFeatures} />}

        {harmonicStructureLoading && <SkeletonLoading title="Structure" />}
        {!harmonicStructureLoading && trackObject && harmonicStructure && (
          <HarmonicStructure
            structure={harmonicStructure}
            width={width}
            audioPlayerRef={audioPlayerRef}
          />
        )}

        {timbreStructureLoading && <SkeletonLoading title="Timbre" />}
        {!timbreStructureLoading && trackObject && timbreStructure && (
          <TimbreStructure
            structure={timbreStructure}
            width={width}
            audioPlayerRef={audioPlayerRef}
          />
        )}

        {chordsFeaturesLoading && <SkeletonLoading title="Chords" />}
        {!chordsFeaturesLoading && trackObject && chordsFeatures && (
          <Chords
            chords={chordsFeatures.chords}
            width={width}
            audioPlayerRef={audioPlayerRef}
          />
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
        {trackObject?.features?.sampled?.avgLoudness &&
          trackObject?.features?.sampled?.smoothedAvgLoudness && (
            <LoudnessGraph
              avgLoudness={trackObject.features.sampled.avgLoudness}
              smoothedAvgLoudness={
                trackObject.features.sampled.smoothedAvgLoudness
              }
              width={width}
            />
          )}
        {trackObject && audioAnalysis && (
          <TempoGraph
            songDuration={audioAnalysis.analysis.track.duration}
            beats={audioAnalysis.analysis.beats}
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
    margin-bottom: 4rem;
  }
`

export default MainContent

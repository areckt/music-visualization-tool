import { useState, createContext, useContext } from 'react'

const GlobalContext = createContext()

export const useGlobalContext = () => useContext(GlobalContext)

const AppContext = ({ children }) => {
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [trackData, setTrackData] = useState()
  const [trackAudioFeatures, setTrackAudioFeatures] = useState()
  const [trackAudioAnalysis, setTrackAudioAnalysis] = useState()
  const [trackObject, setTrackObject] = useState()
  const [harmonicStructure, setHarmonicStructure] = useState()
  const [timbreStructure, setTimbreStructure] = useState()
  const [chordsFeatures, setChordsFeatures] = useState()

  // loading states
  const [harmonicStructureLoading, setHarmonicStructureLoading] =
    useState(false)
  const [timbreStructureLoading, setTimbreStructureLoading] = useState(false)
  const [chordsFeaturesLoading, setChordsFeaturesLoading] = useState(false)

  return (
    <GlobalContext.Provider
      value={{
        selectedTrackId,
        setSelectedTrackId,
        trackData,
        setTrackData,
        trackAudioFeatures,
        setTrackAudioFeatures,
        trackAudioAnalysis,
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
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export default AppContext

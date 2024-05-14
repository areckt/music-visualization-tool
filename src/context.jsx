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
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export default AppContext

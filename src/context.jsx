import { useState, createContext, useContext } from 'react'

const GlobalContext = createContext()

export const useGlobalContext = () => useContext(GlobalContext)

const AppContext = ({ children }) => {
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [trackData, setTrackData] = useState()
  const [trackAudioFeatures, setTrackAudioFeatures] = useState()
  const [trackAudioAnalysis, setTrackAudioAnalysis] = useState()
  const [trackObject, setTrackObject] = useState()
  const [structure, setStructure] = useState()

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
        structure,
        setStructure,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export default AppContext

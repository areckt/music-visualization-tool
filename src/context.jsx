import { useState, createContext, useContext } from 'react'

const GlobalContext = createContext()

export const useGlobalContext = () => useContext(GlobalContext)

const AppContext = ({ children }) => {
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [trackAudioFeatures, setTrackAudioFeatures] = useState()
  const [trackAudioAnalysis, setTrackAudioAnalysis] = useState()

  return (
    <GlobalContext.Provider
      value={{
        selectedTrackId,
        setSelectedTrackId,
        trackAudioFeatures,
        setTrackAudioFeatures,
        trackAudioAnalysis,
        setTrackAudioAnalysis,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export default AppContext

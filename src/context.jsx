import { useState, createContext, useContext } from 'react'

const GlobalContext = createContext()

export const useGlobalContext = () => useContext(GlobalContext)

const AppContext = ({ children }) => {
  const [selectedTrackId, setSelectedTrackId] = useState('')
  const [trackData, setTrackData] = useState()
  const [trackObject, setTrackObject] = useState()
  const [harmonicStructure, setHarmonicStructure] = useState()
  const [timbreStructure, setTimbreStructure] = useState()
  const [chordsFeatures, setChordsFeatures] = useState()
  const [seeker, setSeeker] = useState(0)

  return (
    <GlobalContext.Provider
      value={{
        selectedTrackId,
        setSelectedTrackId,
        trackData,
        setTrackData,
        trackObject,
        setTrackObject,
        harmonicStructure,
        setHarmonicStructure,
        timbreStructure,
        setTimbreStructure,
        chordsFeatures,
        setChordsFeatures,
        seeker,
        setSeeker,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export default AppContext

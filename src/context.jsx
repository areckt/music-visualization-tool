import { useState, createContext, useContext } from 'react'

const GlobalContext = createContext()

export const useGlobalContext = () => useContext(GlobalContext)

const AppContext = ({ children }) => {
  const [selectedTrackId, setSelectedTrackId] = useState('')

  return (
    <GlobalContext.Provider value={{ selectedTrackId, setSelectedTrackId }}>
      {children}
    </GlobalContext.Provider>
  )
}

export default AppContext

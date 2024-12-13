// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import './styles/pico.min.css'
import './styles/App.css'

// const params = new URLSearchParams(window.location.search)
// const code = params.get('code')

const root = document.documentElement
const theme = localStorage.getItem('theme') || 'dark'
root.setAttribute('data-theme', theme)

// const queryClient = new QueryClient()

function App() {
  // return code ? (
  //   <QueryClientProvider client={queryClient}>
  //     <Dashboard code={code} />
  //   </QueryClientProvider>
  // ) : (
  //   <Login />
  // )
  return <Dashboard />
}

export default App

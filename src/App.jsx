import Dashboard from './components/Dashboard'
import Login from './components/Login'
import './styles/pico.min.css'
import './styles/App.css'

const params = new URLSearchParams(window.location.search)
const code = params.get('code')

const root = document.documentElement
root.setAttribute('data-theme', 'light')

function App() {
  return code ? <Dashboard code={code} /> : <Login />
}

export default App

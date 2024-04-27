import Dashboard from './Dashboard'
import Login from './Login'

const clientId = 'c1daea0e75e94a118efba6aad50a9177'
const params = new URLSearchParams(window.location.search)
const code = params.get('code')

function App() {
  return code ? <Dashboard code={code} /> : <Login />
}

export default App

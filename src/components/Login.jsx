import { redirectToAuthCodeFlow } from '../utils/spotifyAPI'

const Login = () => {
  return (
    <main className="container">
      <button onMouseDown={redirectToAuthCodeFlow}>Login</button>
    </main>
  )
}
export default Login

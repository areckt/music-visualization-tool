import { redirectToAuthCodeFlow } from './spotifyAPI'

const Login = () => {
  return <button onClick={redirectToAuthCodeFlow}>Login</button>
}
export default Login

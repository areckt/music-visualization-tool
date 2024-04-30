import { redirectToAuthCodeFlow } from './spotifyAPI'

const Login = () => {
  return (
    <main className="container">
      <button onClick={redirectToAuthCodeFlow}>Login</button>
    </main>
  )
}
export default Login

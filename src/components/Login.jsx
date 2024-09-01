import React from 'react'
import styled from 'styled-components'
import { redirectToAuthCodeFlow } from '../utils/spotifyAPI'

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #121212;
  color: #ffffff;
  font-family: 'Circular', Arial, sans-serif;

  .material-icons {
    font-size: 4rem;
    color: #1ed760;
  }
`

const Icons = styled.div`
  display: flex;
  gap: 0rem;
`

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
  color: white;
`

const LoginButton = styled.button`
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 500px;
  padding: 1rem 2rem 1rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
  display: flex;
  gap: 1rem;
  align-items: center;

  &:hover {
    background-color: #1ed760;
  }
`

const InfoText = styled.p`
  text-align: center;
  margin-top: 2rem;
  font-size: 1rem;
  color: #b3b3b3;
`

const SideNote = styled.p`
  max-width: 40ch;
  text-align: center;
  font-size: 0.75rem;
  color: #b3b3b3;
  line-height: 1rem;
`

const SpotifyLogo = (
  <svg
    width="42"
    height="42"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 496 512"
  >
    <script xmlns="" />
    <path
      fill="#1ed760"
      d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8Z"
    />
    <path d="M406.6 231.1c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3zm-31 76.2c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm-26.9 65.6c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4z" />
    <script xmlns="" />
  </svg>
)

const Login = () => {
  return (
    <PageContainer>
      <Icons>
        <span className="material-icons">music_note</span>
        <span className="material-icons">query_stats</span>
      </Icons>
      <Title>Music Visualization Tool</Title>
      <LoginButton onMouseDown={redirectToAuthCodeFlow}>
        {SpotifyLogo}
        <span>Login with Spotify</span>
      </LoginButton>
      <InfoText>Please log in using your Spotify account</InfoText>
      <SideNote>
        <sup>*</sup>Note that the feature of playing music from inside the app
        is only available to Spotify Premium users.
      </SideNote>
    </PageContainer>
  )
}

export default Login

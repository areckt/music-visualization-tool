import styled from 'styled-components'
import userAvatar from './assets/user-avatar.png'
import { logout, toggleTheme } from './utils'

const Profile = ({ profile }) => {
  const { display_name, images } = profile
  const image = images.length ? images[0].url : userAvatar

  return (
    <ProfileStyled>
      <div className="profile">
        <img src={image} alt={display_name} />
        <p>
          <b>{display_name}</b>
        </p>
      </div>
      <div className="buttons">
        <p>
          <button
            data-tooltip="Toggle light / dark theme"
            className="secondary"
            onClick={toggleTheme}
          >
            ☀️ / 🌙
          </button>
        </p>
        <button className="outline secondary" onClick={logout}>
          Logout
        </button>
      </div>
    </ProfileStyled>
  )
}

const ProfileStyled = styled.article`
  display: flex;
  justify-content: space-between;

  .profile {
    display: flex;
    align-items: center;
    max-width: min-content;
    img {
      width: 64px;
      height: 64px;
      border-radius: var(--pico-border-radius);
    }
    p {
      margin: 0 1rem;
      line-height: 1.125rem;
      text-wrap: pretty;
    }
  }

  .buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
    p {
      margin: 0;
    }
  }
`

export default Profile

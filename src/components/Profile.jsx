import styled from 'styled-components'
import userAvatar from '../assets/user-avatar.png'
import { toggleTheme } from '../utils/utils'

const Profile = () => {
  return (
    <ProfileStyled>
      <div className="profile">
        <img src={userAvatar} alt="User" />
        <p>
          <b>Music Visualization Tool</b>
        </p>
      </div>
      <div className="buttons">
        <p>
          <button
            data-tooltip="Toggle light / dark theme"
            className="outline"
            onMouseDown={toggleTheme}
          >
            ☀️ / 🌙
          </button>
        </p>
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

import { useState, useEffect } from 'react'
import { fetchTracks, fetchUserTopTracks } from '../utils/spotifyAPI.js'
import { mapTracks } from '../utils/utils.js'
import { useGlobalContext } from '../context.jsx'
import styled from 'styled-components'

const TrackSearch = () => {
  const [search, setSearch] = useState('')
  const [tracks, setTracks] = useState([])
  const { selectedTrackId, setSelectedTrackId, setTrackData, setSeeker } =
    useGlobalContext()

  const accessToken = localStorage.getItem('accessToken')
  useEffect(() => {
    ;(async () => {
      const result = await fetchUserTopTracks(accessToken)
      const tracks = mapTracks(result.items)
      setTracks(tracks)
    })()

    return () => {
      setSelectedTrackId('')
    }
  }, [])

  const searchTracks = async (e) => {
    e.preventDefault()
    if (!search) return setTracks([])

    const result = await fetchTracks(accessToken, search)
    const tracks = mapTracks(result.tracks.items)
    setTracks(tracks)
  }

  const handleSelectTrack = (track) => {
    console.log(track)
    setTrackData(track)
    setSelectedTrackId(track.id)
    setSeeker(0)
  }

  return (
    <TrackSearchStyled>
      <h4>Search for a song</h4>
      <form role="search" onSubmit={searchTracks}>
        <input
          type="search"
          placeholder="E.g. 'Never Gonna Give You Up', 'Bohemian Rhapsody'"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <div className="track-list">
        {tracks.map((track) => (
          <div
            className={`track ${selectedTrackId == track.id ? 'active' : ''}`}
            key={track.id}
            onMouseDown={() => handleSelectTrack(track)}
          >
            <img src={track.image} alt={track.name} />
            <div className="track-data">
              <p className="title">
                <b>{track.name}</b>
              </p>
              <p className="artist">{track.artists}</p>
              <p className="duration">{track.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </TrackSearchStyled>
  )
}

const TrackSearchStyled = styled.article`
  .track-list {
    display: flex;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
    overflow-x: scroll;

    .track {
      background-color: var(--pico-form-element-background-color);
      display: flex;
      flex-direction: column;
      padding: 0.25rem;
      max-width: 6.5rem;
      border-radius: var(--pico-border-radius);
      cursor: pointer;
      transition: all 0.2s linear;
      img {
        transition: all 0.2s linear;
        min-width: 6rem;
        max-width: 6rem;
        border-radius: var(--pico-border-radius);
        border: var(--pico-border-width) solid var(--pico-secondary-border);
        aspect-ratio: 1;
      }
      .track-data {
        font-size: 0.725rem;
        p {
          margin: 0.125rem 0;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          line-height: 1rem;
        }
        .title {
          font-size: 0.775rem;
        }
        .artist {
          color: var(--pico-h6-color);
        }
        .duration {
          color: var(--pico-h6-color);
        }
      }
      &:hover {
        background-color: var(--v-card-hover-background-color);
      }
    }

    .track.active {
      max-width: 8.5rem;
      background-color: var(--v-card-active-background-color);
      img {
        min-width: 8rem;
        max-width: 8rem;
      }
    }
  }
`

export default TrackSearch

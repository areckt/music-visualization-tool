import { useState } from 'react'
import { fetchSongs } from './spotifyAPI.js'
import { formatDuration } from './utils.js'
import { useGlobalContext } from './context.jsx'
import styled from 'styled-components'

const TrackSearch = () => {
  const [search, setSearch] = useState('')
  const [tracks, setTracks] = useState([])
  const { selectedTrackId, setSelectedTrackId } = useGlobalContext()

  const searchTracks = async (e) => {
    e.preventDefault()
    setSelectedTrackId('')
    if (!search) return setTracks([])

    let accessToken = localStorage.getItem('accessToken')
    const result = await fetchSongs(accessToken, search)

    const tracks = result.tracks.items.map((track) => {
      const albumImage = track.album.images.reduce((img300, image) => {
        if (image.height == 300) return image
        return img300
      }, track.album.images[0])

      const duration = formatDuration(track.duration_ms)

      return {
        artist: track.artists[0].name,
        title: track.name,
        id: track.id,
        image: albumImage.url,
        durationMs: track.duration_ms,
        duration: duration,
      }
    })

    setTracks(tracks)
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
            onClick={() => setSelectedTrackId(track.id)}
          >
            <img src={track.image} alt={track.title} />
            <div className="track-data">
              <p className="title">
                <b>{track.title}</b>
              </p>
              <p className="artist">{track.artist}</p>
              <p className="duration">{track.duration}</p>
            </div>
          </div>
        ))}
      </div>
      {selectedTrackId && (
        <>
          <p>Selected Track ID: {selectedTrackId}</p>
          <button onClick={() => setSelectedTrackId('')}>Clear</button>
        </>
      )}
    </TrackSearchStyled>
  )
}

const TrackSearchStyled = styled.article`
  .track-list {
    display: flex;
    gap: 0.5rem;
    overflow-x: scroll;
    padding-bottom: 0.75rem;

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

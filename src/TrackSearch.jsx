import { useState } from 'react'
import { fetchSongs } from './spotifyAPI.js'
import { formatDuration } from './utils.js'
import { useGlobalContext } from './context.jsx'

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
    <>
      <h3>SongSearch</h3>
      <form role="search" onSubmit={searchTracks}>
        <input
          type="search"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {selectedTrackId && (
        <>
          <p>Selected Track ID: {selectedTrackId}</p>
          <button onClick={() => setSelectedTrackId('')}>Clear</button>
        </>
      )}
      <div>
        {tracks.map((track) => (
          <div key={track.id}>
            <img
              src={track.image}
              alt={track.title}
              onClick={() => setSelectedTrackId(track.id)}
            />
            <p>{track.artist}</p>
            <p>{track.title}</p>
            <p>{track.duration}</p>
          </div>
        ))}
      </div>
    </>
  )
}
export default TrackSearch

import HorizontalSeparator from '../HorizontalSeparator'
import MoodCompass from './MoodCompass'

const AudioFeaturesCharts = ({ audioFeatures }) => {
  const { valence, energy, loudness, danceability, tempo } = audioFeatures
  return (
    <>
      <MoodCompass
        valence={valence}
        energy={energy}
        loudness={loudness}
        danceability={danceability}
        tempo={tempo}
      />
      <HorizontalSeparator />
    </>
  )
}

export default AudioFeaturesCharts

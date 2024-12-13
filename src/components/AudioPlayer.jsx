import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../context'

const PlayerContainer = styled.div`
  padding: 21px;
  width: 100%;
  position: fixed;
  background-color: var(--pico-background-color);
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -2px 10px -2px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  z-index: 999;
`

const Seeker = styled.div`
  width: 100%;
  height: 4px;
  background-color: var(--pico-muted-border-color);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
`

const SeekerProgress = styled.div`
  position: absolute;
  height: 100%;
  background-color: var(--pico-primary);
  border-radius: 4px;
  width: ${(props) => props.$progress}%;
`

const SeekerHandle = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  background-color: var(--pico-primary);
  border-radius: 50%;
  top: -6px;
  transform: translateX(-50%);
  left: ${(props) => props.$progress}%;
`

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.725rem;
  color: var(--pico-muted-color);
  margin-top: 4px;
`

const ControlsContainer = styled.div`
  position: relative;
  display: flex;
  justify-items: center;
  align-items: center;
  margin-top: -10px;
  height: 32px;
`

const PlayButton = styled.button`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--pico-primary);
  color: white;
  padding: 6px;
  border-radius: 9999px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`
const VolumeSlider = styled.div`
  position: absolute;
  display: flex;
  gap: 12px;
  align-items: center;
  right: 64px;
  top: 2px;
  width: 200px;
  /* height: 4px; */
  /* background-color: var(--pico-muted-color); */
  border-radius: 4px;
  /* appearance: none; */
  /* outline: none; */
  .volume {
    color: var(--pico-primary);
  }
  input {
    /* height: 8px; */
    margin-bottom: 0px;
    &::-webkit-slider-thumb {
      appearance: none;
      width: 12px;
      height: 12px;
      margin-top: -4px;
      /* transform: translateY(6px); */
      background-color: var(--pico-primary);
      border-radius: 50%;
      cursor: pointer;
    }
    &::-webkit-slider-runnable-track {
      height: 4px;
    }
  }
`

const AudioPlayer = forwardRef(({ src }, ref) => {
  const audioRef = useRef(null)
  const seekerRef = useRef(null)
  const intervalRef = useRef(null)
  const { setSeeker } = useGlobalContext()

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    // Method to set progress externally
    setProgress: (newTime) => {
      if (audioRef.current) {
        const percentage = (100 * newTime) / duration
        audioRef.current.currentTime = newTime
        setProgress(percentage)
        setCurrentTime(newTime)
      }
    },
    // Method to play audio
    play: () => {
      if (audioRef.current) {
        audioRef.current.play()
        setIsPlaying(true)
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            setSeeker(audioRef.current.currentTime * 1000)
          }, 33.33333)
        }
      }
    },
    // Method to pause audio
    pause: () => {
      if (audioRef.current) {
        audioRef.current.pause()
        setIsPlaying(false)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    },
  }))

  // Format time to MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } else {
      audioRef.current.play()
      setIsPlaying(true)
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setSeeker(audioRef.current.currentTime * 1000)
        }, 33.33)
      }
    }
  }

  // Handle seeker click to change progress
  const handleSeekerClick = (e) => {
    if (!seekerRef.current) return

    const seekerWidth = seekerRef.current.offsetWidth
    const clickPosition = e.nativeEvent.offsetX
    const percentage = (clickPosition / seekerWidth) * 100

    const newTime = (percentage / 100) * duration
    audioRef.current.currentTime = newTime
    setProgress(percentage)
    setCurrentTime(newTime)
    setSeeker(audioRef.current.currentTime * 1000)
  }

  // Update progress and current time
  const updateProgress = () => {
    if (audioRef.current) {
      const progressPercentage = (audioRef.current.currentTime / duration) * 100
      // console.log(audioRef.current.currentTime)
      // setSeeker(audioRef.current.currentTime * 1000)
      setProgress(progressPercentage)
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // Handle audio metadata loaded
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration)
  }

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    audioRef.current.volume = newVolume
  }

  return (
    <PlayerContainer className="container">
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={updateProgress}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Seeker */}
      <Seeker ref={seekerRef} onClick={handleSeekerClick}>
        <SeekerProgress $progress={progress} />
        <SeekerHandle $progress={progress} />
      </Seeker>

      {/* Time Display */}
      <TimeDisplay>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </TimeDisplay>

      {/* Controls */}
      <ControlsContainer>
        <PlayButton onClick={togglePlayPause}>
          <span className="material-icons">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </PlayButton>

        {/* Volume Slider */}
        <VolumeSlider>
          <span className="volume material-icons">
            {volume > 0.5 ? 'volume_up' : 'volume_down'}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
          />
        </VolumeSlider>
      </ControlsContainer>
    </PlayerContainer>
  )
})

AudioPlayer.displayName = 'AudioPlayer'

export default AudioPlayer

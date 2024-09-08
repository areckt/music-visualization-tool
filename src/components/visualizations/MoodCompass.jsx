import React from 'react'
import styled from 'styled-components'
import { describeSong } from '../../utils/utils'

const MoodCompass = ({ valence, energy, loudness, danceability, tempo }) => {
  // Calculate the position of the chart point based on valence and energy values
  const chartY = (1 - energy) * 150

  const moodDescription = describeSong(
    valence,
    energy,
    loudness,
    danceability,
    tempo
  )

  return (
    <MoodCompassStyled>
      <div className="description">
        <h4>Mood compass</h4>
        <h6>Numerical values: </h6>
        <ul>
          <li>Valence: {valence.toFixed(2)}</li>
          <li>Energy: {energy.toFixed(2)}</li>
          <li>Loudness: {loudness.toFixed(2)} dB</li>
          <li>Danceability: {danceability.toFixed(2)}</li>
          <li>Tempo: {tempo.toFixed(0)} BPM</li>
        </ul>
        <h6>Description: </h6>
        <p>{moodDescription}</p>
      </div>
      <div className="chart-container">
        <div className="gradient-energy" />
        <div className="gradient-valence" />
        <div className="gradient-valence-2" />
        <div className="valence-axis" />
        <div className="energy-axis" />
        <div
          className="axis-title high-energy"
          data-tooltip="Fast, loud, and noisy"
        >
          <span>High energy</span>
        </div>
        <div className="axis-title low-energy" data-tooltip="Calm, slow, soft">
          <span>Low energy</span>
        </div>
        <div
          className="axis-title high-valence"
          data-tooltip="Positive, happy, cheerful, euphoric"
        >
          <span>High valence</span>
        </div>
        <div
          className="axis-title low-valence"
          data-tooltip="Negative, sad, depressed, angry"
        >
          <span>Low Valence</span>
        </div>
        <span
          className="point"
          style={{
            left: `calc(16px + (100% - 32px) * ${valence}`,
            bottom: `calc(0px + (100% - 32px) * ${energy})`,
          }}
        />
      </div>
    </MoodCompassStyled>
  )
}

export default MoodCompass

const MoodCompassStyled = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 1024px) {
    flex-direction: column;
  }

  .description {
    max-width: 40ch;

    @media (max-width: 1024px) {
      max-width: max-content;
    }
  }

  .chart-container {
    position: relative;
    width: 50%;
    margin: 2rem 2rem 2rem auto;
    aspect-ratio: 1;

    @media (max-width: 1024px) {
      width: 100%;
      margin-top: 0;
    }

    .gradient-energy {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(
        to bottom,
        #f9281f,
        #fd6618,
        #fe9124,
        #fdb53f,
        #fdd663,
        #efe576,
        #e1f38e,
        #d6ffa8,
        #b7ffb7,
        #97ffca,
        #76ffdf,
        #53fff5
      );
      opacity: 0.85;
    }

    .gradient-valence {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, #ffffff, #ff0000);
      opacity: 0.75;
      mix-blend-mode: saturation;
    }

    .gradient-valence-2 {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, #000000, #888888);
      opacity: 0.25;
      mix-blend-mode: luminosity;
    }

    .valence-axis {
      position: absolute;
      width: 100%;
      height: 2px;
      background: var(--pico-color);
      top: 50%;
      transform: translateY(-50%);
    }

    .energy-axis {
      position: absolute;
      height: 100%;
      width: 2px;
      background: var(--pico-color);
      left: 50%;
      transform: translateX(-50%);
    }

    .axis-title {
      color: white;
      position: absolute;
      font-weight: 600;
      span {
        text-shadow: 1px 1px 5px #000000;
      }
    }

    .high-valence {
      right: 0.5rem;
      top: 50%;
      transform: translateY(-1lh);
    }

    .low-valence {
      left: 0.5rem;
      top: 50%;
    }

    .high-energy {
      top: 0.5rem;
      left: calc(50% + 0.5rem);
    }

    .low-energy {
      bottom: 0.5rem;
      right: calc(50% + 0.5rem);
    }

    .point {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      backdrop-filter: saturate(200%) contrast(200%) brightness(150%);
      transform-origin: 50% 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
        transform: translateX(-50%) translateY(-50%) scale(2);
      }
      50% {
        opacity: 0.75;
        scale: 1;
        transform: translateX(-50%) translateY(-50%) scale(1);
      }
    }
  }
`

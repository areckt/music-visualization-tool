import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context'
import * as audioUtil from '../../utils/audioUtil'
import * as vis from '../../utils/vis'
import HorizontalSeparator from '../HorizontalSeparator'

const Tonality = ({ tonality, tonalitySlow, keyFeature, width }) => {
  const SECTION_HEIGHT = 20
  const CIRCLE_OF_FIFTHS_SIZE = 300
  const HEIGHT = SECTION_HEIGHT * 2 + 4

  const [circleCollapsed, setCircleCollapsed] = useState(true)
  const [showDescription, setShowDescription] = useState(false)

  const canvasElement = useRef(null)

  const { trackObject } = useGlobalContext()

  let seeker = 0 // TODO: seeker
  const handleClickCanvas = (event) => {
    // TODO: player
  }

  const scale = width / trackObject.getAnalysisDuration()
  const sampleDuration = trackObject.features.sampleDuration
  const fastSampleDuration = trackObject.features.fastSampleDuration
  const currentSample = seeker / 1000 / sampleDuration
  const currentFastSample = seeker / 1000 / fastSampleDuration

  const accumulativeAngle = computeAccumulativeAngle(tonality)
  const accumulativeAngleSlow = computeAccumulativeAngle(tonalitySlow)

  let currentAngle = accumulativeAngle[currentFastSample]
  let currentAngleSlow = accumulativeAngleSlow[currentFastSample]

  const circleOfFifths = audioUtil.circleOfFifths

  let currentKey = keyFeature[currentFastSample]

  function setupCanvas() {
    if (!canvasElement) {
      return
    }
    canvasElement.current.width = width
    drawTonality()
  }

  function tonalityPointerPath(tonality) {
    const scale = CIRCLE_OF_FIFTHS_SIZE / 2
    const radius = Math.tanh(tonality[currentFastSample][1] * 3) * 0.5
    const x = 0 // Math.cos(tonality[currentSample][0] * Math.PI * 2);
    const y = -1 //Math.sin(tonality[currentSample][0] * Math.PI * 2);

    let path = ''
    path = path.concat(' M ', scale, ' ', scale)
    path = path.concat(
      ' L ',
      scale + x * scale * radius,
      ' ',
      scale + y * scale * radius
    )
    path = path.concat(' Z')
    return path
  }

  function drawTonality() {
    const ctx = canvasElement.current.getContext('2d')

    ctx.clearRect(0, 0, width, HEIGHT)

    for (let i = 0; i < tonality.length; i++) {
      const x = i * fastSampleDuration * scale

      ctx.fillStyle = color(
        tonalitySlow[i][0],
        Math.sqrt(tonalitySlow[i][1] * 2),
        1
      )
      ctx.fillRect(
        x,
        SECTION_HEIGHT + 2,
        fastSampleDuration * scale + 2,
        SECTION_HEIGHT
      )
      ctx.fillStyle = color(tonality[i][0], tonality[i][1] * 1.5, 1)
      ctx.fillRect(x, 0, fastSampleDuration * scale + 2, SECTION_HEIGHT)
    }
  }

  function computeAccumulativeAngle(tonality) {
    const accumulativeAngle = []
    let prevAngle = tonality[0][0]
    let windCounter = 0
    for (let i = 0; i < tonality.length; i++) {
      const current = tonality[i][0]
      const passThrough0Pos =
        current < prevAngle && prevAngle - current > 1 + current - prevAngle
      const passThrough0Neg =
        current > prevAngle && current - prevAngle > 1 + prevAngle - current
      if (passThrough0Pos) windCounter++
      if (passThrough0Neg) windCounter--
      accumulativeAngle.push(windCounter + current)
      prevAngle = current
    }
    return accumulativeAngle
  }

  function color(angle, saturation = 1.3, opacity = 1) {
    if (angle < 0) angle += Math.abs(Math.floor(angle))
    return vis.circleOfFifthsColor(angle % 1, saturation, opacity)
  }

  function keyName(keyNumber) {
    return audioUtil.keyNames[keyNumber]
  }

  useEffect(() => {
    setupCanvas()
  }, [width])

  return (
    <TonalityStyled>
      <div className="visualizationHeader">
        <h4>Tonality</h4>
        <div className="buttons">
          <span
            role="button"
            className={circleCollapsed ? 'off' : 'on'}
            onMouseDown={() => setCircleCollapsed(!circleCollapsed)}
            data-tooltip={
              circleCollapsed
                ? 'Circle of 5-ths is hidden'
                : 'Circle of 5-ths is shown'
            }
          >
            <span className="material-icons">
              {circleCollapsed ? 'horizontal_rule' : 'density_medium'}
            </span>
          </span>
          <span
            role="button"
            className={showDescription ? 'on' : 'off'}
            onMouseDown={() => setShowDescription(!showDescription)}
            data-tooltip="Toggle description"
          >
            <span className="material-icons">help</span>
          </span>
        </div>
      </div>
      <div
        className={
          showDescription ? 'description showDescription' : 'description'
        }
      >
        <p>
          This visualization shows the song's tonality change over time.
          Similarly to the chords, the colors correspond to the circle of
          fifths. The{' '}
          <span className="material-icons">
            {circleCollapsed ? 'horizontal_rule' : 'density_medium'}
          </span>{' '}
          button toggles visibility of the circle of fifths with keys and their
          corresponding colors. A real-time, fast and slow pointers show the
          detected key for a given moment.
        </p>
      </div>
      <canvas
        ref={canvasElement}
        className="tonalityCanvas"
        width={width}
        height={HEIGHT}
        onClick={handleClickCanvas}
      ></canvas>

      <div
        style={{
          height: circleCollapsed ? '0px' : CIRCLE_OF_FIFTHS_SIZE + 'px',
        }}
        className="circleOfFifthsTonality"
      >
        <svg
          className="tonalitySVG"
          width={CIRCLE_OF_FIFTHS_SIZE}
          height={circleCollapsed ? '0px' : CIRCLE_OF_FIFTHS_SIZE + 'px'}
        >
          <circle
            cx={CIRCLE_OF_FIFTHS_SIZE / 2}
            cy={CIRCLE_OF_FIFTHS_SIZE / 2}
            r={CIRCLE_OF_FIFTHS_SIZE / 2}
            fill="var(--pico-card-background-color)"
          ></circle>
          <g
            transform={`translate(${CIRCLE_OF_FIFTHS_SIZE / 2},${
              CIRCLE_OF_FIFTHS_SIZE / 2
            })`}
            stroke="var(--pico-background-color)"
            strokeWidth="2"
          >
            {circleOfFifths.map((keyNumber, index) => (
              <path
                key={'circleOfFifths' + index}
                d={`M 0 0 0 -${CIRCLE_OF_FIFTHS_SIZE / 2} A ${
                  CIRCLE_OF_FIFTHS_SIZE / 2
                } ${CIRCLE_OF_FIFTHS_SIZE / 2} 0 0 1 ${
                  (Math.sin((1 / 12) * Math.PI * 2) * CIRCLE_OF_FIFTHS_SIZE) / 2
                } ${
                  -(Math.cos((1 / 12) * Math.PI * 2) * CIRCLE_OF_FIFTHS_SIZE) /
                  2
                } Z`}
                transform={`rotate(${((-index - 0.5) / 12) * 360} 0 0)`}
                fill={color(1 - index / 12, 1, 0.9)}
              />
            ))}
            <circle
              r={(CIRCLE_OF_FIFTHS_SIZE / 2) * 0.58}
              fill="var(--pico-card-background-color)"
            ></circle>
            <circle
              r={(CIRCLE_OF_FIFTHS_SIZE / 2) * 0.8}
              fill="none"
              stroke="var(--pico-background-color)"
              strokeWidth="2"
            ></circle>
            {circleOfFifths.map((keyNumber, index) => (
              <text
                key={'circleOfFifthsText' + index}
                x={
                  (Math.sin((index / 12) * Math.PI * 2) *
                    CIRCLE_OF_FIFTHS_SIZE *
                    0.9) /
                  2
                }
                y={
                  -(
                    Math.cos((index / 12) * Math.PI * 2) *
                    CIRCLE_OF_FIFTHS_SIZE *
                    0.9
                  ) / 2
                }
                className="co5text"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {keyName(keyNumber)}
              </text>
            ))}
            {circleOfFifths.map((keyNumber, index) => (
              <text
                key={'circleOfFifthsTextM' + index}
                x={
                  (Math.sin(((index - 3) / 12) * Math.PI * 2) *
                    CIRCLE_OF_FIFTHS_SIZE *
                    0.7) /
                  2
                }
                y={
                  -(
                    Math.cos(((index - 3) / 12) * Math.PI * 2) *
                    CIRCLE_OF_FIFTHS_SIZE *
                    0.7
                  ) / 2
                }
                className="co5textm"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {keyName(keyNumber + 12)}
              </text>
            ))}
          </g>
          <path
            className="tonalityPointerSlow"
            transform={`rotate(${currentAngleSlow * 360} ${
              CIRCLE_OF_FIFTHS_SIZE / 2
            } ${CIRCLE_OF_FIFTHS_SIZE / 2})`}
            d={tonalityPointerPath(tonalitySlow)}
            strokeWidth="4"
            stroke={color(currentAngleSlow, 1, 1)}
          />
          <path
            className="tonalityPointer"
            transform={`rotate(${currentAngle * 360} ${
              CIRCLE_OF_FIFTHS_SIZE / 2
            } ${CIRCLE_OF_FIFTHS_SIZE / 2})`}
            d={tonalityPointerPath(tonality)}
            strokeWidth="4"
            stroke={color(currentAngle)}
          />
        </svg>
      </div>
    </TonalityStyled>
  )
}

const TonalityStyled = styled.div`
  .visualizationHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .buttons {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      span[role='button'] {
        cursor: pointer;
        border-radius: 999px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.25rem;
        width: 1.5rlh;
        height: 1.5rlh;
        aspect-ratio: 1;
        transition: opacity 0.2s ease-in-out, background-color 0.2s ease-in-out;
        &.on {
          background-color: var(--pico-primary-background);
        }
        &.off {
          background-color: var(--pico-secondary-background);
          opacity: 0.75;
        }
        span {
          /* font-size: 1rem; */
        }
      }
    }
  }
  .description {
    max-height: 0px;
    overflow: clip;
    transition: max-height 0.2s ease-in-out;
    p {
      span {
        color: var(--pico-primary-background);
        translate: 0 0.2lh;
      }
    }
    &.showDescription {
      max-height: 9lh;
    }
  }

  .circleOfFifthsTonality {
    position: relative;
    transition: 0.3s;

    .tonalitySVG {
      position: absolute;
      transition: 0.5s;
      top: 0;
      left: 0;
      z-index: 20;

      .tonalityPointer {
        transition: 0.15s;
        z-index: 20;
      }

      .tonalityPointerSlow {
        transition: 0.15s;
        z-index: 20;
      }
      g {
        .co5text {
          font: 18px system-ui;
          fill: white;
          stroke: transparent;
        }
        .co5textm {
          font: 12px system-ui;
          fill: white;
          stroke: transparent;
        }
      }
    }
  }
`

export default Tonality

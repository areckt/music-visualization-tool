import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context'
import * as vis from '../../utils/vis'
import HorizontalSeparator from '../HorizontalSeparator'

const Chords = ({ chords, width }) => {
  const BLOCK_HEIGHT = 15
  const CHORD_NAME_HEIGHT = 30
  const MAX_CHORD_VIEW_DISTANCE = 15
  const CHORD_SCROLL_MIDDLE = 50

  const [chordsCollapsed, setChordsCollapsed] = useState(false)
  const [showDescription, setShowDescription] = useState(false)

  const canvasElement = useRef(null)

  const { trackObject } = useGlobalContext()

  let height = BLOCK_HEIGHT * (chordsCollapsed ? 1 : 12)

  const scale = width / trackObject.getAnalysisDuration()

  let seekerTime = 0 // TODO: seeker
  const handleChordClick = (chord) => {
    // TODO: player
  }

  const calculateChordGapOffset = () => {
    const chordTotalDuration = new Float32Array(12)

    chords.forEach((chord) => {
      chordTotalDuration[Math.round(chord.angle * 12)] +=
        chord.end - chord.start
    })

    let min = Number.POSITIVE_INFINITY
    let minIndex = -1
    for (let i = 0; i < 12; i++) {
      if (chordTotalDuration[i] < min) {
        min = chordTotalDuration[i]
        minIndex = i
      }
    }
    return minIndex / 12
  }

  const CHORD_GAP_OFFSET = calculateChordGapOffset()

  function drawChordNames() {
    const ctx = canvasElement.current.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.clearRect(0, 0, width, CHORD_NAME_HEIGHT)

    function roundedRect(x, y, width, height, radius) {
      ctx.beginPath()
      ctx.moveTo(x + width, y + height)
      ctx.arcTo(x, y + height, x, y, radius)
      ctx.arcTo(x, y, x + width, y, radius)
      ctx.arcTo(x + width, y, x + width, y + height, radius)
      ctx.arcTo(x + width, y + height, x, y + height, radius)
      ctx.fill()
    }

    const lineStep = CHORD_NAME_HEIGHT
    ctx.fillStyle = 'white'

    chords.forEach((chord) => {
      const chordSeekerStartOffset = chord.start - seekerTime
      let startX = CHORD_SCROLL_MIDDLE + chordSeekerStartOffset * scale * 22
      const chordSeekerEndOffset = chord.end - seekerTime
      const endX = CHORD_SCROLL_MIDDLE + chordSeekerEndOffset * scale * 22

      if (
        chordSeekerEndOffset > 0 &&
        chordSeekerStartOffset < MAX_CHORD_VIEW_DISTANCE
      ) {
        if (chord.start <= seekerTime) {
          ctx.fillStyle = color(chord, 1)
          if (endX - CHORD_SCROLL_MIDDLE - 3 > 6) {
            roundedRect(
              CHORD_SCROLL_MIDDLE,
              0,
              endX - CHORD_SCROLL_MIDDLE - 3,
              CHORD_NAME_HEIGHT,
              3
            )
            ctx.strokeStyle = 'rgba(0,0,0,0.3)'
            ctx.lineWidth = 3
            const textSpaceOffset = chord.name.length * 12
            if (!isMajor(chord)) {
              for (
                let i = startX + textSpaceOffset;
                i < endX;
                i += lineStep / 2
              ) {
                if (i < CHORD_SCROLL_MIDDLE - lineStep) continue
                ctx.beginPath()
                ctx.moveTo(i, CHORD_NAME_HEIGHT)
                if (i + lineStep > endX - 3) {
                  ctx.lineTo(
                    endX - 3,
                    CHORD_NAME_HEIGHT + 3 - (lineStep - (lineStep + i - endX))
                  )
                } else {
                  ctx.lineTo(i + lineStep, 0)
                }
                ctx.stroke()
              }
              ctx.fillStyle = '#121212'
              ctx.fillRect(
                CHORD_SCROLL_MIDDLE - lineStep,
                0,
                lineStep,
                CHORD_NAME_HEIGHT
              )
            }
          }

          ctx.fillStyle = 'white'
          ctx.font = '18px system-ui'

          ctx.fillText(
            chord.name,
            CHORD_SCROLL_MIDDLE - 50 + 2,
            CHORD_NAME_HEIGHT - 4
          )
        } else {
          const opacity = 1 - chordSeekerStartOffset / MAX_CHORD_VIEW_DISTANCE
          ctx.fillStyle = color(chord, opacity * 1.5)
          roundedRect(startX, 0, endX - startX - 3, CHORD_NAME_HEIGHT, 3)
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
          ctx.font = '14px system-ui'
          ctx.lineWidth = 3
          if (!isMajor(chord)) {
            const textSpaceOffset = chord.name.length * 12
            for (
              let i = startX + textSpaceOffset;
              i < endX;
              i += lineStep / 2
            ) {
              ctx.beginPath()
              ctx.moveTo(i, CHORD_NAME_HEIGHT)
              if (i + lineStep > endX - 3) {
                ctx.lineTo(
                  endX - 3,
                  CHORD_NAME_HEIGHT + 3 - (lineStep - (lineStep + i - endX))
                )
              } else {
                ctx.lineTo(i + lineStep, 0)
              }
              ctx.stroke()
            }
          }

          ctx.fillStyle = `rgba(0,0,0,${opacity * 2})`

          ctx.fillText(chord.name, startX + 2, CHORD_NAME_HEIGHT - 4)
        }
      }
    })

    ctx.fillRect(CHORD_SCROLL_MIDDLE - 1, 0, 2, CHORD_NAME_HEIGHT)
  }

  function setupCanvas() {
    if (!canvasElement) {
      return
    }
    canvasElement.current.width = width
    drawChordNames()
  }

  function color(chord, confidence = 1) {
    return vis.circleOfFifthsColor(chord.angle % 1, 1, confidence)
  }

  function colorBrightness(chord, brightness) {
    return vis.circleOfFifthsColorBrightness(chord.angle % 1, 0.5, brightness)
  }

  function isMajor(chord) {
    return chord.index <= 11
  }

  useEffect(() => {
    setupCanvas()
  }, [width])

  return (
    <ChordsStyled>
      <div className="visualizationHeader">
        <h4>Chords</h4>
        <div className="buttons">
          <span
            role="button"
            className={chordsCollapsed ? 'off' : 'on'}
            onMouseDown={() => setChordsCollapsed(!chordsCollapsed)}
            data-tooltip={
              chordsCollapsed
                ? 'Chords are displayed in a single row'
                : 'Chords are displayed in multiple rows'
            }
          >
            <span className="material-icons">
              {chordsCollapsed ? 'horizontal_rule' : 'density_medium'}
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
          This visualization shows major and minor triad chords over time. The
          colors and positions correspond to the circle of fifths, such that
          relative minor and major chords have the same color, with minor chords
          being distinguished by diagonal stripes. The{' '}
          <span className="material-icons">
            {chordsCollapsed ? 'horizontal_rule' : 'density_medium'}
          </span>{' '}
          button toggles chords display mode (single row / multiple rows).
        </p>
      </div>
      <svg className="chordsSVG" width={width} height={height}>
        <defs>
          <pattern
            id="textureDiagonal"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <path
              d="M-1,1 l2,-2
                            M0,4 l4,-4
                            M3,5 l2,-2"
              style={{ stroke: '#999999', strokeWidth: 1 }}
            />
          </pattern>
          <pattern
            id="texture"
            width="4"
            height="1"
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <path
              d="M 0 0 l 10 0"
              style={{ stroke: '#414141', strokeWidth: 1 }}
            />
          </pattern>
          <mask id="diagonalMask" x="0" y="0" width="1" height="1">
            <rect
              x="0"
              y="0"
              width="1000"
              height="1000"
              fill="url(#textureDiagonal)"
            />
          </mask>
        </defs>
        {chords.map((chord, index) => (
          <rect
            key={index + 'chord'}
            className="chord"
            rx="3"
            x={chord.start * scale + 0.5}
            y={
              chordsCollapsed
                ? '0'
                : ((2 - chord.angle + CHORD_GAP_OFFSET) % 1) *
                    (height - BLOCK_HEIGHT) +
                  0.5
            }
            width={(chord.end - chord.start) * scale - 0.5}
            height={BLOCK_HEIGHT - 0.5}
            fill={color(chord)}
            onMouseDown={() => handleChordClick(chord)}
          />
        ))}
        {chords.map((chord, index) => (
          <rect
            key={index + 'chordOverlay'}
            style={{ display: isMajor(chord) ? 'none' : 'inherit' }}
            className="chordOverlay"
            rx="3"
            x={chord.start * scale + 0.5}
            y={
              chordsCollapsed
                ? '0'
                : ((2 - chord.angle + CHORD_GAP_OFFSET) % 1) *
                    (height - BLOCK_HEIGHT) +
                  0.5
            }
            width={(chord.end - chord.start) * scale - 0.02}
            height={BLOCK_HEIGHT - 0.5}
            fill={colorBrightness(chord, 0.5)}
            mask="url(#diagonalMask)"
            onMouseDown={() => handleChordClick(chord)}
          />
        ))}
      </svg>
      <canvas
        ref={canvasElement}
        className="chordNameCanvas"
        width={width}
        height={CHORD_NAME_HEIGHT}
      ></canvas>
      <HorizontalSeparator />
    </ChordsStyled>
  )
}

const ChordsStyled = styled.div`
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
  .chordsSVG {
    transition: 0.3s;
    .chord,
    .chordOverlay {
      transition: 0.3s;
      cursor: pointer;
      &:hover {
        fill: var(--pico-contrast-hover) !important;
      }
    }
  }
`

export default Chords

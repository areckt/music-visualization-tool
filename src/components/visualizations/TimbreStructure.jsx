import { useState } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context'
import * as vis from '../../utils/vis'
import TimbreStructureSection from './TimbreStructureSection'
import TimbreStructureEvents from './TimbreStructureEvents'
import HorizontalSeparator from '../HorizontalSeparator'

const TimbreStructure = ({ structure, width }) => {
  const SECTION_HEIGHT = 45
  const PADDING_TOP = 10
  const GRADIENT_STEP_AMOUNT = 8
  const HEIGHT = 200
  const [showLoudness, setShowLoudness] = useState(true)
  const [showDescription, setShowDescription] = useState(false)

  const { trackObject } = useGlobalContext()

  const scale = width / trackObject.getAnalysisDuration()

  const gradientSteps = () => {
    let steps = []
    for (let i = 0; i < GRADIENT_STEP_AMOUNT; i++) {
      steps.push(i / GRADIENT_STEP_AMOUNT)
    }
    return steps
  }

  const color = (mdsFeature) => {
    return vis.sinebowColorNormalizedRadius(mdsFeature, 1, 1)
  }

  return (
    <TimbreStructureStyled>
      <div className="visualizationHeader">
        <h4>Timbre</h4>
        <div className="buttons">
          <span
            role="button"
            className={showLoudness ? 'on' : 'off'}
            onClick={() => setShowLoudness(!showLoudness)}
            data-tooltip={
              showLoudness
                ? 'Loudness embedding: ON'
                : 'Loudness embedding: OFF'
            }
          >
            <span className="material-icons">equalizer</span>
          </span>
          <span
            role="button"
            className={showDescription ? 'on' : 'off'}
            onClick={() => setShowDescription(!showDescription)}
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
          This visualization shows timbre in the form of a segmented graph. The
          vertical axis and its color denote similarity. The higher the section,
          the more "energy" and "brightness" of the music it corresponds to. A
          sudden change in timbre will show up as a break in the graph. The{' '}
          <span className="material-icons">equalizer</span> button toggles the
          embedding of loudness in the visualization. <br />
          The dots shown below the graph are moments of timbral anomaly, points
          in the music where the timbre is unique and locally distinct.
        </p>
      </div>
      <svg className="timbreStructureSVG" width={width} height={HEIGHT}>
        <defs>
          <linearGradient id="pathGradient" x1="0" x2="0" y="0" y2="1">
            {gradientSteps().map((gradientStep) => (
              <stop
                key={gradientStep}
                offset={`${gradientStep}`}
                style={{ stopColor: color(1 - gradientStep), stopOpacity: 1 }}
              />
            ))}
          </linearGradient>
        </defs>
        {structure.timbreStructure.map((section, index) => (
          <TimbreStructureSection
            key={index + 'timbre'}
            section={section}
            height={SECTION_HEIGHT}
            scale={scale}
            showLoudness={showLoudness}
            verticalOffset={PADDING_TOP}
            containerHeight={HEIGHT}
          />
        ))}
      </svg>
      <TimbreStructureEvents events={structure.events} width={width} />
      <HorizontalSeparator />
    </TimbreStructureStyled>
  )
}

export default TimbreStructure

const TimbreStructureStyled = styled.div`
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
`

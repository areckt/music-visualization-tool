import { useState } from 'react'
import styled from 'styled-components'
import HarmonicStructureSection from './HarmonicStructureSection'
import { useGlobalContext } from '../../context'
import HorizontalSeparator from '../HorizontalSeparator'

const HarmonicStructure = ({ structure, width }) => {
  const SECTION_HEIGHT = 40
  const PADDING_TOP = 10
  const [showLoudness, setShowLoudness] = useState(true)
  const [catColoring, setCatColoring] = useState(false)
  const [showDescription, setShowDescription] = useState(false)

  const { trackObject } = useGlobalContext()

  const scale = width / trackObject.getAnalysisDuration()

  const groupAmount = () => {
    return (
      structure.reduce((max, val) => {
        return val.groupID > max ? val.groupID : max
      }, 0) + 1
    )
  }

  const height = groupAmount() * SECTION_HEIGHT + 20

  return (
    <HarmonicStructureStyled>
      <div className="visualizationHeader">
        <h4>Structure</h4>
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
            className={catColoring ? 'off' : 'on'}
            onClick={() => setCatColoring(!catColoring)}
            data-tooltip={
              catColoring
                ? 'Colors show similarity between groups'
                : 'Colors show similarity within a group'
            }
          >
            <span className="material-icons">palette</span>
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
          This visualization shows section blocks, where each row (group) of
          blocks represents a repeating harmonic sequence. For example, in many
          songs a section block will represent a repeated chord progression that
          could correspond to the song's chorus. The{' '}
          <span className="material-icons">equalizer</span> button toggles the
          embedding of loudness in the visualization. The{' '}
          <span className="material-icons">palette</span> button switches colors
          to show either the harmonic sequential similarity within a group, or
          between the groups.
        </p>
      </div>
      <svg className="structureSVG" width={width} height={height}>
        {structure.map((section, index) => (
          <HarmonicStructureSection
            className="structureSection"
            key={index + 'course'}
            section={section}
            height={SECTION_HEIGHT}
            scale={scale}
            verticalOffset={PADDING_TOP}
            showLoudness={showLoudness}
            coloring={catColoring ? 'categoricalMDS' : 'circular'}
          />
        ))}
      </svg>
      <HorizontalSeparator />
    </HarmonicStructureStyled>
  )
}
export default HarmonicStructure

const HarmonicStructureStyled = styled.div`
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

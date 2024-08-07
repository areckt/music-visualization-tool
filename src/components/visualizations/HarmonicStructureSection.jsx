import styled from 'styled-components'
import * as vis from '../../utils/vis'
import { useGlobalContext } from '../../context'

const HarmonicStructureSection = ({
  section,
  height,
  scale,
  verticalOffset,
  showLoudness,
  coloring,
}) => {
  const GLOW_OPACITY = 0.4
  const GLOW_SIZE = 6
  const NO_LOUDNESS_HEIGHT = 0.8

  let seekerIsInSection = false
  const { trackObject, seeker } = useGlobalContext()

  const width = Math.max(1, (section.end - section.start) * scale - 2)
  const x = section.start * scale
  const y = verticalOffset + section.groupID * height + verticalOffset

  const calcColor = () => {
    switch (coloring) {
      default:
      case 'cluster' || 'group':
        return vis.goldenRatioCategoricalColor(section.groupID, 0, 1)
      case 'circular':
        return vis.sinebowColorNormalizedRadius(
          section.colorAngle,
          section.colorRadius,
          1
        )
      case 'categoricalMDS':
        return vis.sinebowColorNormalizedRadius(
          section.catColorAngle,
          section.catColorRadius,
          1
        )
      case 'linear':
        return vis.zeroOneColorWarm(section.mdsFeature)
    }
  }
  const color = calcColor()

  const dynamics = (sample) => {
    return trackObject.features.sampled.dynamics[sample]
  }

  const loudnessTime = (time) => {
    const sample = Math.floor(time / trackObject.features.sampleDuration)
    return dynamics(sample)
  }

  const directLoudnessTime = (time) => {
    const sample = Math.floor(
      time / trackObject.features.directLoudnessSampleDuration
    )
    return (
      trackObject?.features?.directLoudness[sample] /
        trackObject.features.maxLoudness || 0
    )
  }

  const glowRectSize = () => {
    return (
      GLOW_SIZE *
      height *
      (0.15 +
        directLoudnessTime(seeker / 1000) / 4 +
        Math.pow(loudnessTime(seeker / 1000), 1.5))
    )
  }

  const shapedSectionPath = () => {
    const halfHeight = height / 2
    let roundoff = 4
    let step = 4 / width
    step = Math.max(0.001, step)

    const yMid = (time) => {
      if (section.graph === undefined) return y + halfHeight
      const factorOfWidth =
        (time - section.start) / (section.end - section.start)
      const sampleInSection = Math.min(
        Math.floor(factorOfWidth * section.graph.length),
        section.graph.length - 1
      )
      const mdsValue = section.graph[sampleInSection]
      return mdsValue * (containerHeight - height) + halfHeight
    }

    const tooSmall = width <= roundoff * 2
    if (tooSmall) {
      roundoff = width / 2
    }

    const firstSample = Math.round(
      (x + roundoff) / scale / trackObject.features.sampleDuration
    )
    const firstLoudness = showLoudness
      ? dynamics(firstSample)
      : NO_LOUDNESS_HEIGHT
    const firstYMid = yMid(section.start)

    let lastSample = Math.floor(
      (x + width - roundoff) / scale / trackObject.features.sampleDuration
    )

    const lastLoudness = showLoudness
      ? dynamics(lastSample)
      : NO_LOUDNESS_HEIGHT
    const lastYMid = yMid(section.end)

    let path = `M ${x} ${Math.round(firstYMid)} L ${x} ${
      firstYMid - Math.max(0, halfHeight * firstLoudness - roundoff)
    } Q ${x} ${firstYMid - halfHeight * firstLoudness}, ${x + roundoff} ${
      firstYMid - halfHeight * firstLoudness
    }`

    const startFraction = roundoff / width
    const endFraction = 1 - roundoff / width

    // Top
    const pointXSet = []
    for (let i = startFraction + step; i < endFraction - step; i += step) {
      const pointX = x + i * width
      pointXSet.push(pointX)
      const sample = Math.round(
        pointX / scale / trackObject.features.sampleDuration
      )
      const loudness = showLoudness ? dynamics(sample) : NO_LOUDNESS_HEIGHT
      const pointY = yMid(pointX / scale) - halfHeight * loudness
      path = path.concat(' L ', pointX, ' ', pointY)
    }

    // Turnaround on the right
    path = path.concat(
      ' L ',
      x + width - roundoff,
      ' ',
      lastYMid - halfHeight * lastLoudness
    )
    path = path.concat(
      ` Q ${x + width} ${lastYMid - halfHeight * lastLoudness}, ${x + width} ${
        lastYMid - Math.max(0, halfHeight * lastLoudness - roundoff)
      } L ${x + width} ${
        lastYMid + Math.max(0, halfHeight * lastLoudness - roundoff)
      } Q ${x + width} ${lastYMid + halfHeight * lastLoudness}, ${
        x + width - roundoff
      } ${lastYMid + halfHeight * lastLoudness}`
    )

    // Bottom
    pointXSet.reverse()
    for (const pointX of pointXSet) {
      const sample = Math.round(
        pointX / scale / trackObject.features.sampleDuration
      )
      const loudness = showLoudness ? dynamics(sample) : NO_LOUDNESS_HEIGHT
      const pointY = yMid(pointX / scale) + halfHeight * loudness
      path = path.concat(' L ', pointX, ' ', pointY)
    }

    // close of path with last sample
    path = path.concat(
      ` L ${x + roundoff} ${firstYMid + halfHeight * firstLoudness} Q ${x} ${
        firstYMid + halfHeight * firstLoudness
      }, ${x} ${
        firstYMid + Math.max(0, halfHeight * firstLoudness - roundoff)
      } Z `
    )

    return path
  }

  return (
    <HarmonicStructureSectionStyled $sectionColor={color}>
      <defs>
        <linearGradient
          id={`glowRectGradient${section.start}${section.end}`}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop offset="0" style={{ stopColor: color, stopOpacity: 0 }} />
          <stop
            offset="0.5"
            style={{ stopColor: color, stopOpacity: GLOW_OPACITY }}
          />
          <stop offset="1" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <rect
        className="glowRect"
        fill={`url(#glowRectGradient${section.start}${section.end})`}
        x={x}
        y={y + height / 2 - (seekerIsInSection ? glowRectSize() / 2 : 0)}
        width={width}
        height={seekerIsInSection ? glowRectSize() : 0}
        opacity={seekerIsInSection ? '1' : '0'}
      ></rect>
      <path
        className="shapedSection"
        d={shapedSectionPath()}
        fill={color}
      ></path>
    </HarmonicStructureSectionStyled>
  )
}

const HarmonicStructureSectionStyled = styled.g`
  .shapedSection {
    z-index: 10;
    pointer-events: all;
    transition: 0.3s;
    stroke-linejoin: round;
    stroke: ${(props) => props.$sectionColor};
    stroke-width: 0px;
    cursor: pointer;

    &:hover {
      stroke-width: 8px;
    }
  }

  .glowRect {
    z-index: -1;
    pointer-events: none;
    transition-timing-function: linear;
    transition: 0.5s;
  }
`

export default HarmonicStructureSection

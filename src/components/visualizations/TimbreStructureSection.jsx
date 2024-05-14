import { useGlobalContext } from '../../context'
import styled from 'styled-components'
import * as vis from '../../utils/vis'
import * as svgVariableWidthLine from 'svg-variable-width-line'

const TimbreStructureSection = ({
  section,
  height,
  scale,
  showLoudness,
  verticalOffset,
  containerHeight,
}) => {
  const GLOW_OPACITY = 0.4
  const GLOW_SIZE = 6
  const GRADIENT_STEP_AMOUNT = 16
  const STROKE_WIDTH = 0.5
  const NO_LOUDNESS_HEIGHT = 0.8

  let seekerIsInSection = false,
    seeker = 0 // TODO: implement seeker

  const { trackObject } = useGlobalContext()

  const verticalPosition = section.mdsFeature * (containerHeight - height)
  const color = vis.zeroOneColorWarm(section.mdsFeature)
  const min = Math.min(...section.graph)
  const max = Math.max(...section.graph)
  const x = section.start * scale
  const sectionDuration = section.end - section.start

  const currentSample = () => {
    if (!seekerIsInSection) return section.mdsFeature
    const timeFactor = (seeker / 1000 - section.start) / sectionDuration
    const sampleIndex = Math.floor(timeFactor * section.graph.length)
    return section.graph[sampleIndex]
  }

  const currentY =
    (1 - currentSample()) * (containerHeight - height) + height / 2

  const width = Math.max(1, (section.end - section.start) * scale - 2)
  const dynamicsArray = trackObject.features.sampled.dynamics
  const directLoudness = trackObject.features.directLoudness

  const shapedSectionPath = () => {
    const halfHeight = height / 2
    const points = []
    points.push({
      x: section.start * scale,
      y: (1 - section.graph[1]) * (containerHeight - height) + halfHeight,
      w: 0,
    })
    section.graph.forEach((point, index) => {
      if (
        (index > 0 &&
          index < section.graph.length - 1 &&
          (index + 1) % 3 !== 0) ||
        (index > 0 && section.graph.length < 3)
      ) {
        const factorOfWidth = index / section.graph.length
        const xTime =
          section.start + (section.end - section.start) * factorOfWidth
        const xPos = xTime * scale

        const y = (1 - point) * (containerHeight - height) + halfHeight
        const w =
          (showLoudness
            ? dynamics(Math.round(xTime / trackObject.features.sampleDuration))
            : NO_LOUDNESS_HEIGHT) *
          height *
          STROKE_WIDTH
        points.push({ x: xPos, y, w })
      }
    })

    points.push({
      x: section.end * scale,
      y:
        (1 - section.graph[section.graph.length - 2]) *
          (containerHeight - height) +
        halfHeight,
      w: 0,
    })

    const { d } = svgVariableWidthLine.compute(
      ...svgVariableWidthLine.smooth(points, 2)
    )
    return d
  }

  const gradientSteps = () => {
    let steps = []
    for (let i = 0; i < GRADIENT_STEP_AMOUNT; i++) {
      steps.push(i / GRADIENT_STEP_AMOUNT)
    }
    return steps
  }

  const dynamics = (sample) => {
    return (dynamicsArray && dynamicsArray[sample]) || 0
  }

  const loudnessTime = (time) => {
    const sample = Math.floor(time / trackObject.features.sampleDuration)
    return dynamicsArray[sample] / trackObject.features.maxLoudness || 0
  }

  const directLoudnessTime = (time) => {
    const sample = Math.floor(
      time / trackObject.features.directLoudnessSampleDuration
    )
    return directLoudness[sample] / trackObject.features.maxLoudness || 0
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

  const colorGradient = (mdsFeature) => {
    return vis.sinebowColorNormalizedRadius(
      (0.8 - mdsFeature * 0.9) % 1,
      0.85,
      0.95
    )
  }

  const currentColor = colorGradient(currentSample())

  return (
    <TimbreStructureSectionStyled $currentColor={currentColor}>
      <defs>
        <linearGradient
          id={`glowRectGradient${section.start}${section.end}`}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop
            offset="0"
            style={{ stopColor: currentColor, stopOpacity: 0 }}
          />
          <stop
            offset="0.5"
            style={{ stopColor: currentColor, stopOpacity: GLOW_OPACITY }}
          />
          <stop
            offset="1"
            style={{ stopColor: currentColor, stopOpacity: 0 }}
          />
        </linearGradient>
        <linearGradient
          id={`sectionGradient${section.start}`}
          x1="0"
          x2="0"
          y1={max / (max - min + 0.01)}
          y2={-(1 - max) / (max - min + 0.01)}
        >
          {gradientSteps().map((gradientStep) => (
            <stop
              key={gradientStep}
              offset={`${gradientStep}`}
              style={{ stopColor: colorGradient(gradientStep), stopOpacity: 1 }}
            />
          ))}
        </linearGradient>
      </defs>
      <rect
        className="glowRect"
        fill={`url(#sectionGradient${section.start}${section.end})`}
        x={x}
        y={currentY - (seekerIsInSection ? glowRectSize() / 2 : 0)}
        width={width}
        height={seekerIsInSection ? glowRectSize() : 0}
        opacity={seekerIsInSection ? '1' : '0'}
      ></rect>
      <path
        className="shapedSection"
        d={shapedSectionPath()}
        shapeRendering="geometricPrecision"
        fill={`url(#sectionGradient${section.start})`}
      ></path>
    </TimbreStructureSectionStyled>
  )
}
export default TimbreStructureSection

const TimbreStructureSectionStyled = styled.g`
  .shapedSection {
    z-index: 10;
    pointer-events: all;
    transition: 0.3s;
    stroke-linejoin: round;
    stroke: ${(props) => props.$currentColor};
    stroke-width: 0px;
    cursor: pointer;

    &:hover {
      stroke-width: 5px;
    }
  }

  .glowRect {
    z-index: -1;
    pointer-events: none;
    transition-timing-function: linear;
    transition: 0.5s;
  }
`

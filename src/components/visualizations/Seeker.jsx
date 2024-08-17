import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context'

const Seeker = ({ width, height }) => {
  const { trackObject: track, seeker } = useGlobalContext()
  const [seekerNormalized, setSeekerNormalized] = useState(0)
  const analysisDuration = track.getAnalysisDuration()

  useEffect(() => {
    setSeekerNormalized(seeker / (analysisDuration * 1000))
  }, [seeker, track])

  return (
    <SeekerSVG
      height={height}
      width={width}
      style={{ transform: `translate(${0}px, 0px)` }}
    >
      <SeekerRect
        x={seekerNormalized * width - 1.25}
        y={0}
        width={2.5}
        height={height * 2}
      />
    </SeekerSVG>
  )
}

const SeekerSVG = styled.svg`
  position: absolute;
  pointer-events: none;
  z-index: 50;
`

const SeekerRect = styled.rect`
  fill: var(--pico-primary-background);
`

export default Seeker

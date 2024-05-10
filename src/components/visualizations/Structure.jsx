import { useState } from 'react'
import styled from 'styled-components'
import Section from './Section'
import { useGlobalContext } from '../../context'

const Structure = ({ structure, width }) => {
  const SECTION_HEIGHT = 40
  const PADDING_TOP = 10
  const [showLoudness, setShowLoudness] = useState(true)
  const [catColoring, setCatColoring] = useState(false)

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
    <StructureStyled className="pt-5">
      <div className="row">
        <div className="col">Structure</div>
      </div>
      <svg className="structureSVG" width={width} height={height}>
        {structure.map((section, index) => (
          <Section
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
    </StructureStyled>
  )
}
export default Structure

const StructureStyled = styled.div`
  .structureSVG {
  }
`

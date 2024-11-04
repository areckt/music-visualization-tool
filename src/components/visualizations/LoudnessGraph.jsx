import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Seeker from './Seeker'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const Select = styled.select`
  margin-left: auto;
  width: min-content;
  padding-block: 0.15rem;
  font-size: 0.675rem;
`

const CanvasContainer = styled.div`
  width: 100%;
  position: relative;
`

const Canvas = styled.canvas`
  width: 100%;
  height: auto;
  display: block;
`

const Tooltip = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
  transform: translate(-50%, -100%);
  margin-top: -8px;
  transition: opacity 0.2s linear;
  z-index: 1000;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    margin-left: -4px;
    border-width: 4px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
  }
`

const LoudnessGraph = ({
  avgLoudness = [],
  smoothedAvgLoudness = [],
  width = 1,
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [selectedData, setSelectedData] = useState('avgLoudness')
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    value: 0,
    index: 0,
  })

  // Constants for graph styling
  const PADDING = 2
  const POINT_RADIUS = 2
  const GRAPH_COLOR = '#2196F3'
  const HOVER_COLOR = '#ffffff'

  const drawGraph = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const data =
      selectedData === 'avgLoudness' ? avgLoudness : smoothedAvgLoudness

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (data.length === 0) return

    // Find data ranges
    const minValue = Math.min(...data)
    const maxValue = Math.max(...data)
    const graphWidth = canvas.width - 2 * PADDING
    const graphHeight = canvas.height - 2 * PADDING

    // Draw data points and lines
    ctx.beginPath()
    ctx.strokeStyle = GRAPH_COLOR
    ctx.lineWidth = 4

    data.forEach((value, index) => {
      const x = PADDING + (index / (data.length - 1)) * graphWidth
      const y =
        canvas.height -
        PADDING -
        ((value - minValue) / (maxValue - minValue)) * graphHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw points
    data.forEach((value, index) => {
      const x = PADDING + (index / (data.length - 1)) * graphWidth
      const y =
        canvas.height -
        PADDING -
        ((value - minValue) / (maxValue - minValue)) * graphHeight

      ctx.beginPath()
      ctx.arc(
        x,
        y,
        tooltip.index === index ? POINT_RADIUS * 2 : POINT_RADIUS,
        0,
        2 * Math.PI
      )
      ctx.fillStyle = tooltip.index === index ? HOVER_COLOR : GRAPH_COLOR
      ctx.fill()
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current

    // Set canvas dimensions based on container size
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = Math.min(150, rect.width * 0.6)
      drawGraph()
    }

    // Update size initially and on window resize
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [avgLoudness, smoothedAvgLoudness, selectedData, tooltip])

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const data =
      selectedData === 'avgLoudness' ? avgLoudness : smoothedAvgLoudness

    if (data.length === 0) return

    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const graphWidth = canvas.width - 2 * PADDING

    // Find closest point
    const pointIndex = Math.round(
      ((x - PADDING) / graphWidth) * (data.length - 1)
    )

    if (pointIndex >= 0 && pointIndex < data.length) {
      const value = data[pointIndex]
      const pointX = PADDING + (pointIndex / (data.length - 1)) * graphWidth
      const minValue = Math.min(...data)
      const maxValue = Math.max(...data)
      const graphHeight = canvas.height - 2 * PADDING
      const pointY =
        canvas.height -
        PADDING -
        ((value - minValue) / (maxValue - minValue)) * graphHeight

      setTooltip({
        show: true,
        x: (pointX / canvas.width) * rect.width,
        y: (pointY / canvas.height) * rect.height,
        value: value.toFixed(2),
        index: pointIndex,
      })
    }
  }

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, value: 0, index: -1 })
  }

  return (
    <Container>
      <Select
        value={selectedData}
        onChange={(e) => setSelectedData(e.target.value)}
      >
        <option value="avgLoudness">Average Loudness</option>
        <option value="smoothedAvgLoudness">Smoothed Average Loudness</option>
      </Select>

      <CanvasContainer ref={containerRef}>
        <Seeker height={150} width={width} />
        <Canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {tooltip.show && (
          <Tooltip
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
            }}
          >
            {tooltip.value}
          </Tooltip>
        )}
      </CanvasContainer>
    </Container>
  )
}

export default LoudnessGraph

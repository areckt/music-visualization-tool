import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Seeker from './Seeker'

const Container = styled.div`
  width: 100%;
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

const TempoGraph = ({ songDuration = 0, beats = [], width = 1 }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    time: 0,
    bpm: 0,
  })
  const [bpmData, setBpmData] = useState([])
  const [minMaxBpm, setMinMaxBpm] = useState({ min: 0, max: 0 })
  const [canvasHeight, setCanvasHeight] = useState(10)

  // Constants for graph styling
  const PADDING_X = 0
  const PADDING_Y = 16
  const POINT_RADIUS = 2
  const GRAPH_COLOR = '#FF4081'
  const HOVER_COLOR = '#FFFFFF'

  // Calculate BPM data from beats
  useEffect(() => {
    if (beats.length < 2) return

    const calculateBPM = () => {
      const bpmPoints = []

      // Calculate BPM for each pair of consecutive beats
      for (let i = 0; i < beats.length - 1; i++) {
        const currentBeat = beats[i]
        const nextBeat = beats[i + 1]
        const timeDiff = nextBeat.start - currentBeat.start

        if (timeDiff > 0) {
          // Calculate BPM: (1 beat / time difference in minutes)
          const bpm = 60 / timeDiff

          bpmPoints.push({
            time: currentBeat.start,
            bpm: bpm,
            confidence: (currentBeat.confidence + nextBeat.confidence) / 2,
          })
        }
      }

      // Apply smoothing to reduce extreme variations
      const smoothedPoints = bpmPoints.map((point, index) => {
        if (index === 0 || index === bpmPoints.length - 1) return point

        const prevPoint = bpmPoints[index - 1]
        const nextPoint = bpmPoints[index + 1]
        const avgBpm = (prevPoint.bpm + point.bpm + nextPoint.bpm) / 3

        return {
          ...point,
          bpm: avgBpm,
        }
      })

      const minBpm = Math.min(...smoothedPoints.map((d) => d.bpm))
      const maxBpm = Math.max(...smoothedPoints.map((d) => d.bpm))

      setMinMaxBpm({
        min: minBpm,
        max: maxBpm,
      })

      const canv_height = Math.max(Math.min((maxBpm - minBpm) * 10, 300), 40)
      console.log('canv_height: ', canv_height)
      setCanvasHeight(canv_height)

      return smoothedPoints
    }

    setBpmData(calculateBPM())
  }, [beats])

  const drawGraph = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (bpmData.length === 0) return

    // Find data ranges
    const minBpm = minMaxBpm.min
    const maxBpm = minMaxBpm.max
    const graphWidth = canvas.width - 2 * PADDING_X
    const graphHeight = canvas.height - 2 * PADDING_Y

    // Draw data points and lines
    ctx.beginPath()
    ctx.strokeStyle = GRAPH_COLOR
    ctx.lineWidth = 4

    bpmData.forEach((point, index) => {
      const x = PADDING_X + (point.time / songDuration) * graphWidth
      const y =
        canvas.height -
        PADDING_Y -
        ((point.bpm - minBpm) / (maxBpm - minBpm)) * graphHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw points with opacity based on confidence
    bpmData.forEach((point, index) => {
      const x = PADDING_X + (point.time / songDuration) * graphWidth
      const y =
        canvas.height -
        PADDING_Y -
        ((point.bpm - minBpm) / (maxBpm - minBpm)) * graphHeight

      ctx.beginPath()
      ctx.arc(
        x,
        y,
        tooltip.time === point.time ? POINT_RADIUS * 2 : POINT_RADIUS,
        0,
        2 * Math.PI
      )
      ctx.fillStyle = tooltip.time === point.time ? HOVER_COLOR : GRAPH_COLOR
      ctx.fill()
    })
  }

  useEffect(() => {
    console.log('CANVAS HEIGHT: ', canvasHeight)

    const canvas = canvasRef.current
    // Set canvas dimensions based on container size
    const updateCanvasSize = () => {
      canvas.width = width
      canvas.height = canvasHeight
      drawGraph()
    }

    // Update size initially and on window resize
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [canvasHeight, bpmData, tooltip])

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    if (bpmData.length === 0) return

    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const time =
      ((x - PADDING_X) / (canvas.width - 2 * PADDING_X)) * songDuration

    // Find closest point
    const closestPoint = bpmData.reduce((closest, point) => {
      return Math.abs(point.time - time) < Math.abs(closest.time - time)
        ? point
        : closest
    }, bpmData[0])

    const pointX =
      PADDING_X +
      (closestPoint.time / songDuration) * (canvas.width - 2 * PADDING_X)
    const minBpm = Math.min(...bpmData.map((d) => d.bpm))
    const maxBpm = Math.max(...bpmData.map((d) => d.bpm))
    const pointY =
      canvas.height -
      PADDING_Y -
      ((closestPoint.bpm - minBpm) / (maxBpm - minBpm)) *
        (canvas.height - 2 * PADDING_Y)

    setTooltip({
      show: true,
      x: (pointX / canvas.width) * rect.width,
      y: (pointY / canvas.height) * rect.height,
      time: closestPoint.time,
      bpm: closestPoint.bpm,
    })
  }

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, time: 0, bpm: 0 })
  }

  return (
    <Container>
      <CanvasContainer ref={containerRef}>
        <Seeker height={canvasHeight} width={width} />
        <Canvas
          key={canvasHeight}
          ref={canvasRef}
          height={canvasHeight}
          width={width}
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
            {tooltip.bpm.toFixed(1)} BPM
          </Tooltip>
        )}
      </CanvasContainer>
    </Container>
  )
}

export default TempoGraph

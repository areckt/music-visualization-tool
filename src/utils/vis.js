import * as d3 from 'd3'
import * as audioUtil from './audioUtil'
import * as Track from './Track'

const PHI = (1 + Math.sqrt(5)) / 2

export const colorWheel = d3
  .scaleLinear()
  .domain([
    0,
    1 / 12,
    2 / 12,
    3 / 12,
    4 / 12,
    5 / 12,
    6 / 12,
    7 / 12,
    8 / 12,
    9 / 12,
    10 / 12,
    11 / 12,
    1,
  ])
  .interpolate(d3.interpolateHcl)
  .range([
    d3.rgb('#da321f'),
    d3.rgb('#e06300'),
    d3.rgb('#e89b00'),
    d3.rgb('#ebcb03'),
    d3.rgb('#9fbb04'),
    d3.rgb('#2cbe03'),
    d3.rgb('#03b779'),
    d3.rgb('#06b3bd'),
    d3.rgb('#3875cc'),
    d3.rgb('#7503db'),
    d3.rgb('#c203ae'),
    d3.rgb('#e84b90'),
    d3.rgb('#da321f'),
  ])
export const zeroOneColor = d3
  .scaleSequential()
  .domain([0, 1])
  .interpolator(d3.interpolateViridis)
export const zeroOneColorGreys = d3
  .scaleSequential()
  .domain([0, 1])
  .interpolator(d3.interpolateGreys)
export const zeroOneColorGreysDark = d3
  .scaleLinear()
  .domain([0, 1])
  .range([d3.rgb('#444444'), d3.rgb('#ffffff')])
export const zeroOneColorGreysLight = d3
  .scaleLinear()
  .domain([0, 1])
  .range([d3.rgb('#000000'), d3.rgb('#cccccc')])
export const zeroOneColorWarm = d3
  .scaleSequential()
  .domain([0, 1])
  .interpolator(d3.interpolateWarm)
export const zeroOneColorCool = d3
  .scaleSequential()
  .domain([0, 1])
  .interpolator(d3.interpolateCool)
export const zeroOneColorTurbo = d3
  .scaleSequential()
  .domain([0, 1])
  .interpolator(d3.interpolateTurbo)
export const pitchColor = zeroOneColor
export const greyScaleColor = d3
  .scaleSequential()
  .domain([1, 0])
  .interpolator(d3.interpolateGreys)
export const rainbowColor = d3
  .scaleSequential()
  .domain([0, 11])
  .interpolator(d3.interpolateRainbow)
export const sinebowColorNormalized = d3
  .scaleSequential()
  .domain([0, 1])
  .interpolator(d3.interpolateSinebow)
export const rawTimbreColor = d3
  .scaleDiverging()
  .domain([-300, 0, 300])
  .interpolator(d3.interpolateRdBu)
export const divergingColor = d3
  .scaleDiverging()
  .domain([-1, 0, 1])
  .interpolator(d3.interpolateRdBu)
export function goldenRatioCategoricalColor(i, offset, opacity) {
  const angle = (offset - i * PHI) % 1
  const c = d3.rgb(sinebowColorNormalized(angle))
  return `rgba(${c.r},${c.g},${c.b},${opacity})`
}
export const categoryColor = d3.scaleOrdinal().range(d3.schemeCategory10)
export function categoryColorWithOpacity(color, opacity) {
  const c = d3.rgb(categoryColor(color))
  return `rgba(${c.r},${c.g},${c.b},${opacity})`
}
export function lightness(color, lightness) {
  const hslColor = d3.hsl(color)
  hslColor.l = lightness
  return hslColor.formatHex()
}

export function sinebowColorNormalizedRadius(angle, radius, confidence = 1) {
  const color = sinebowColorNormalized(angle)
  const colorHSL = d3.hsl(color)
  colorHSL.s = radius //Math.pow(radius, 0.2);
  colorHSL.l = (colorHSL.l - 0.5) * radius + 0.5
  const c = d3.rgb(colorHSL)
  return `rgba(${c.r},${c.g},${c.b},${confidence})`
}

export function circleOfFifthsColor(angle, radius, confidence = 1) {
  const color = colorWheel(angle)
  const colorHSL = d3.hsl(color)
  colorHSL.s = radius //Math.pow(radius, 0.2);
  colorHSL.l = (colorHSL.l - 0.5) * radius + 0.5
  const c = d3.rgb(colorHSL)
  return `rgba(${c.r},${c.g},${c.b},${confidence})`
}

export function circleOfFifthsColorBrightness(angle, radius, brightness = 1) {
  const color = colorWheel(angle)
  const colorHSL = d3.hsl(color)
  colorHSL.s = radius //Math.pow(radius, 0.2);
  colorHSL.l = brightness
  return d3.rgb(colorHSL)
}

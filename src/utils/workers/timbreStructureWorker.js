import { expose } from 'comlink'
import * as filter from '../filter'
import * as structure from '../structure'
import * as noveltyDetection from '../noveltyDetection'
import * as Features from '../Features'
import * as mds from '../mds'
import Section from '../Section'
import * as events from '../events'
import * as SSM from '../SSM'

const obj = {
  computeTimbreStructure(timbreFeatures, sampleDuration) {
    const segmentedTimbreGraphNew = calculateSegmentedTimbreGraph(
      timbreFeatures,
      sampleDuration
    )

    const smoothingLength = Math.round(2 / sampleDuration)
    const confidenceThreshold = 0.3
    const smoothedFeatures = filter.gaussianBlurFeatures(
      timbreFeatures,
      smoothingLength
    )
    const downSampleAmount = 300
    const downSampledFeatures = Features.downSample(
      smoothedFeatures,
      downSampleAmount
    )
    const downSampleDuration =
      (sampleDuration * timbreFeatures.length) / downSampleAmount
    let coloredSamples = structure.MDSColorTimbreSamples(downSampledFeatures)
    coloredSamples = structure.MDSIntuitionFlip(
      coloredSamples,
      downSampledFeatures
    )
    const derivative = [Math.abs(coloredSamples[0] - coloredSamples[2])]
    for (let i = 1; i < coloredSamples.length - 1; i++) {
      derivative.push(Math.abs(coloredSamples[i + 1] - coloredSamples[i - 1]))
    }
    derivative.push(0)
    const peaks = noveltyDetection.findPeaks(derivative)
    const segmentedTimbreGraph = []
    let prevPeakSample = 0
    for (let p = 1; p <= peaks.length; p++) {
      const peak =
        p < peaks.length
          ? peaks[p]
          : { sample: coloredSamples.length, confidence: 1 }
      const segment = []
      if (peak.confidence > confidenceThreshold) {
        for (let i = prevPeakSample + 1; i < peak.sample + 1; i++) {
          if (i < coloredSamples.length) segment.push(coloredSamples[i])
        }

        const start = prevPeakSample * downSampleDuration
        const end = start + segment.length * downSampleDuration
        const section = new Section({ start, end })
        const smoothedSegment = filter.gaussianBlur1D(segment, 3, 'mirror')
        section.graph = smoothedSegment.map((val) => 1 - val)
        section.mdsFeature = segment.reduce((a, v, i) => (a * i + v) / (i + 1))
        segmentedTimbreGraph.push(section)
        prevPeakSample = peak.sample
      }
    }

    const ssmTimbre = SSM.calculateSSM(
      timbreFeatures,
      sampleDuration,
      false,
      0,
      'euclideanTimbre'
    )
    const blurredTimbreLarge = filter.gaussianBlur2DOptimized(ssmTimbre, 5)
    const timbreNoveltyColumn =
      noveltyDetection.absoluteEuclideanColumnDerivative(blurredTimbreLarge)
    const smoothTimbreNoveltyColumn = filter.gaussianBlur1D(
      timbreNoveltyColumn,
      5
    )
    const timbreSegments = structure.createSegmentsFromNovelty(
      smoothTimbreNoveltyColumn,
      sampleDuration,
      0.2
    )
    const processedTimbreSegments = structure.processTimbreSegments(
      timbreFeatures,
      timbreSegments,
      sampleDuration
    )

    const smoothedTimbreFeatures = filter.gaussianBlurFeatures(
      timbreFeatures,
      4
    )
    const eventArray = events.detectAverageWindow(
      smoothedTimbreFeatures,
      sampleDuration,
      60,
      0.6
    )

    const newEvents = events.computeEvents(timbreFeatures, sampleDuration)

    return {
      timbreStructure: processedTimbreSegments,
      events: newEvents,
      segmentedTimbreGraph: segmentedTimbreGraphNew,
    }
  },
}

function calculateSegmentedTimbreGraph(features, sampleDuration) {
  const segmentationSmoothingLength = Math.round(5)
  const continuousSmoothingLength = Math.round(10)

  const ssmTimbre = SSM.calculateSSM(
    features,
    sampleDuration,
    false,
    0,
    'cosine'
  )
  const blurredTimbreLarge = filter.gaussianBlur2DOptimized(ssmTimbre, 5)
  const timbreNoveltyColumn =
    noveltyDetection.absoluteEuclideanColumnDerivative(blurredTimbreLarge)

  const segmentationSmoothedFeatures = filter.gaussianBlurFeatures(
    features,
    segmentationSmoothingLength
  )
  const segmentationDerivative = noveltyDetection.featureDerivative(
    segmentationSmoothedFeatures
  )
  const smoothedSegmentationDerivative = filter.gaussianBlur1D(
    segmentationDerivative,
    5
  )
  const segments = structure.createSegmentsFromNovelty(
    smoothedSegmentationDerivative,
    sampleDuration,
    0.2
  )
  const averagedColoredSegments = structure.processTimbreSegments(
    features,
    segments,
    sampleDuration
  )

  const segmentedFeatures = []
  segments.forEach((segment) => {
    const featureSegment = features.slice(
      segment.startSample,
      segment.endSample
    )
    const smoothedFeatureSegment = filter.gaussianBlurFeatures(
      featureSegment,
      continuousSmoothingLength
    )
    segmentedFeatures.push(smoothedFeatureSegment)
  })

  const frankenFeatures = []
  segmentedFeatures.forEach((featureSegment) => {
    frankenFeatures.push(...featureSegment)
  })

  const downSampleAmount = 200
  const downSampledFeatures = Features.downSample(
    frankenFeatures,
    downSampleAmount
  )

  let mdsFeature = mds.getMDSCoordinatesSamples(downSampledFeatures, 'Classic')
  mdsFeature = structure.MDSIntuitionFlip(mdsFeature, downSampledFeatures)

  segments.forEach((segment, index) => {
    const downSampleStart = Math.round(
      (downSampleAmount / features.length) * segment.startSample
    )
    const downSampleEnd = Math.round(
      (downSampleAmount / features.length) * segment.endSample
    )

    segmentedFeatures[index] = mdsFeature.slice(downSampleStart, downSampleEnd)

    if (segmentedFeatures[index].length === 1) {
      segmentedFeatures[index].push(segmentedFeatures[index][0])
    }

    segment.graph = segmentedFeatures[index].map((val) => 1 - val)
    segment.mdsFeature = averagedColoredSegments[index].mdsFeature
  })

  return segments
}

expose(obj)

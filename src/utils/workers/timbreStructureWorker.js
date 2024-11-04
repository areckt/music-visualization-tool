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

    const newEvents = events.computeEvents(timbreFeatures, sampleDuration)

    return {
      // timbreStructure: processedTimbreSegments,
      events: newEvents,
      segmentedTimbreGraph: segmentedTimbreGraphNew,
    }
  },
}

function calculateSegmentedTimbreGraph(features, sampleDuration) {
  // console.log('sample duration ', sampleDuration)

  const segmentationSmoothingLength = Math.round(5)
  const continuousSmoothingLength = Math.round(10)

  const segmentationSmoothedFeatures = filter.gaussianBlurFeatures(
    features,
    segmentationSmoothingLength
  )
  const segmentationDerivative = noveltyDetection.featureDerivative(
    segmentationSmoothedFeatures
  )
  const smoothedSegmentationDerivative = filter.gaussianBlur1D(
    segmentationDerivative,
    5 // kernel size
  )
  const segments = structure.createSegmentsFromNovelty(
    smoothedSegmentationDerivative,
    sampleDuration,
    0.2 // threshold
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

    // if (segmentedFeatures[index].length === 1) {
    //   segmentedFeatures[index].push(segmentedFeatures[index][0])
    // }

    segment.graph = segmentedFeatures[index].map((val) => 1 - val)
    segment.mdsFeature = averagedColoredSegments[index].mdsFeature
  })

  return segments.filter((s) => s.graph.length > 1)
}

expose(obj)

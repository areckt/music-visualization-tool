import Features from './Features'
import * as filter from './filter'
import * as noveltyDetection from './noveltyDetection'
import * as structure from './structure'
import { releaseProxy, wrap } from 'comlink'
import HarmonicStructureWorker from './workers/harmonicStructureWorker?worker'
import TimbreStructureWorker from './workers/timbreStructureWorker?worker'

export const GAMMA = 1.7
export const CLUSTERAMOUNT = 10
export const samples = 600
export const sampleDuration = 0.33
export const sampleBlur = 1 // smaller than 1 => no blur, e.g. when 2 every sample is blurred over duration of 2 samples

export const enhanceBlurLength = 6
export const threshold = 0.65
export const thresholdPercentage = 0.5
export const tempoRatios = [0.66, 0.81, 1, 1.22, 1.5]

export const SPminSize = 2 // Minimal size of segment in scape plot
export const SPstepSize = 2 // Size of the step between segment start and size in scape plot
export const createScapePlot = false

export const averageLoudnessBlur = 3

export const maxTimbreDownSamples = 200

const useSampled = true
const allPitches = false

export default class Track {
  eventListenerSet = false

  trackData = null
  analysisData = null
  groundTruth = null

  markers = [] // {time, color, label}
  markersCreated = 0

  matrixes = [] // {name, matrix}
  scapePlot = null
  scapePlotAnchorColor = null
  graphFeatures = [] // {name, data};
  structures = [] // {name, data: [{start, duration, label}]}

  separators = []
  courseStructure = []
  fineStructure = []

  harmonicStructureCourse = []
  harmonicStructureFine = []

  chordsVector = []
  chords = []
  tonalityFeatureSmall = []
  tonalityFeatureLarge = []

  keyFeature = []

  //tempoFeature = { data: [], min: 0, max: 0, avg: 0 };

  events = []
  timbreStructure = []
  timbreFeatureGraph
  segmentedTimbreGraph = []

  features

  processed = false
  processing = false

  smoothedTimbre = []
  tsneCoords = []
  clusters = []
  clusterSections

  setHarmonicStructure
  setTimbreStructure

  constructor(
    trackData,
    analysisData,
    setHarmonicStructure,
    setTimbreStructure
  ) {
    this.trackData = trackData
    this.analysisData = analysisData
    this.setHarmonicStructure = setHarmonicStructure
    this.setTimbreStructure = setTimbreStructure

    this.process()
  }

  process() {
    this.processing = true
    console.log('Processing Track: ', this.getName())

    this.features = new Features(this.analysisData, {
      samples: samples,
      sampleDuration: sampleDuration,
      sampleBlur: sampleBlur,
      downsampleAmount: maxTimbreDownSamples,
    })

    const segmentationSmoothingLength = Math.round(10)
    const segmentationSmoothedFeatures = filter.gaussianBlurFeatures(
      this.features.sampled.timbres,
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
      this.features.sampleDuration,
      0.2
    )

    const segmentedFeatures = []
    segments.forEach((segment) => {
      const featureSegment = this.features.sampled.timbres.slice(
        segment.startSample,
        segment.endSample
      )
      const smoothedFeatureSegment = filter.gaussianBlurFeatures(
        featureSegment,
        5
      )
      segmentedFeatures.push(smoothedFeatureSegment)
    })

    const frankenFeatures = []
    segmentedFeatures.forEach((featureSegment) => {
      frankenFeatures.push(...featureSegment)
    })
    this.smoothedTimbre = frankenFeatures
    console.log('Features processed')
    console.log('this.features', this.features)

    this.computeHarmonicStructure()
    this.computeTimbreStructure()

    this.processed = true
    this.processing = false
  }

  async computeHarmonicStructure() {
    const worker = new HarmonicStructureWorker()
    const obj = wrap(worker)
    const result = await obj.computeHarmonicStructure({
      pitchFeatures: this.features.sampled.pitches,
      sampleDuration: this.features.sampleDuration,
      allPitches,
      enhanceBlurLength,
      tempoRatios,
    })

    console.log('Final harmonicStructure: ', result.harmonicStructure)
    this.harmonicStructureCourse = result.harmonicStructure
    this.setHarmonicStructure(this.harmonicStructureCourse)

    await obj[releaseProxy]()
    worker.terminate()
  }

  async computeTimbreStructure() {
    const worker = new TimbreStructureWorker()
    const obj = wrap(worker)
    const result = await obj.computeTimbreStructure(
      this.features.sampled.timbres,
      this.features.sampleDuration
    )

    console.log('Final timbre structure: ', result)
    this.timbreStructure = result.timbreStructure
    this.events = result.events
    this.segmentedTimbreGraph = result.segmentedTimbreGraph
    this.setTimbreStructure(this.segmentedTimbreGraph)

    await obj[releaseProxy]()
    worker.terminate()
  }

  // GETTERS
  getName() {
    return this.trackData.name
  }
  getAnalysisDuration() {
    return this.analysisData.track.duration
  }
}

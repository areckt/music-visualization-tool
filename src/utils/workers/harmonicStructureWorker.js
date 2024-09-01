import { expose } from 'comlink'
import * as structure from '../structure'
import * as SSM from '../SSM'
import * as filter from '../filter'
import * as keyDetection from '../keyDetection'
import Matrix from '../dataStructures/Matrix'

const obj = {
  computeHarmonicStructure(options) {
    // console.log('options in computeHarmonicWorker: ', options)
    const sampleAmount = options.pitchFeatures.length

    const smoothedpitchFeatures = filter.gaussianBlurFeatures(
      options.pitchFeatures,
      1
    )

    const pitchSSM = SSM.calculateSSM(
      smoothedpitchFeatures,
      options.sampleDuration,
      options.allPitches,
      0.35,
      'euclidean'
    )
    const enhancedSSM = SSM.enhanceSSM(
      pitchSSM,
      {
        blurLength: options.enhanceBlurLength,
        tempoRatios: options.tempoRatios,
        strategy: 'linmed',
      },
      options.allPitches
    )
    const transpositionInvariantPre =
      SSM.makeTranspositionInvariant(enhancedSSM)
    let strictPathMatrixHalf = SSM.rowColumnAutoThreshold(
      transpositionInvariantPre,
      0.15
    ) // .22 //.15 (30/06)
    //strictPathMatrixHalf = SSM.multiply(strictPathMatrixHalf, 1.3);
    //strictPathMatrixHalf = SSM.threshold(strictPathMatrixHalf, 0.1);
    const strictPathMatrix = Matrix.fromHalfMatrix(strictPathMatrixHalf)

    const duration = 3 // samples
    const sampledSegments = structure.createFixedDurationStructureSegments(
      sampleAmount,
      options.sampleDuration,
      duration
    )

    // console.log('sampledSegments: ', sampledSegments)

    const updateCallback = (
      harmonicStructure,
      state = 'processing',
      strategy = 'Classic'
    ) => {
      // console.log('HarmonicsStructure', harmonicStructure)
      let finalHarmonicStructure = harmonicStructure

      try {
        finalHarmonicStructure = colorHarmonicStructure(
          harmonicStructure,
          strictPathMatrix,
          strategy
        )
      } catch (error) {
        console.warn(
          'There was an error updating the structure: ',
          error,
          '\nThe final harmonic structure is: ',
          finalHarmonicStructure
        )
      } finally {
        finalHarmonicStructure.forEach((section) => {
          const startInSamples = Math.floor(
            section.start / options.sampleDuration
          )
          const endInSamples = Math.floor(section.end / options.sampleDuration)
          const key = keyDetection.detect(
            options.pitchFeatures,
            startInSamples,
            endInSamples
          )
          section.key = key
        })

        return { state, harmonicStructure: finalHarmonicStructure }
      }
    }

    let [harmonicStructure, mutorGroupAmount, segmentsMutor] =
      structure.findMuteDecomposition(
        strictPathMatrix,
        sampledSegments,
        options.sampleDuration,
        'classic',
        'or',
        updateCallback
      )

    return updateCallback(harmonicStructure, 'done', 'GD')
  },
}

function colorHarmonicStructure(harmonicStructure, ssm, strategy) {
  // console.log('colorHarmonicStructure strategy: ', strategy)
  const harmonicStructureMDS = structure.MDSColorSegments(
    harmonicStructure,
    ssm,
    'DTW',
    strategy,
    true
  )
  const sortedHarmonicStructureMDS = harmonicStructureMDS.sort((a, b) => {
    if (a.groupID < b.groupID) return -1
    if (b.groupID < a.groupID) return 1
    if (a.groupID === b.groupID) {
      return a.start - b.start
    }
  })
  return sortedHarmonicStructureMDS
}

expose(obj)

import { expose } from 'comlink'
import * as filter from '../filter'
import * as structure from '../structure'
import * as noveltyDetection from '../noveltyDetection'
import * as Features from '../Features'
import * as mds from '../mds'
import Section from '../Section'
import * as events from '../events'
import * as SSM from '../SSM'
import * as keyDetection from '../keyDetection'
import * as chordDetection from '../chordDetection'

const obj = {
  computeChords(
    pitchFeatures,
    fastSampledPitch,
    sampleDuration,
    fastSampledPitchDuration
  ) {
    // key of entire song
    const key = keyDetection.detect(pitchFeatures, 0, pitchFeatures.length)

    // chords
    const minChordDuration = 0.5
    const blurLengthInSeconds = 0.5
    const blurLengthInSamples =
      (1 / fastSampledPitchDuration) * blurLengthInSeconds
    const blurredPitches = filter.gaussianBlurFeatures(
      fastSampledPitch,
      blurLengthInSamples
    )
    const chordFeatures =
      chordDetection.getMajorMinorChordVectors(blurredPitches)
    const maxChordFeatures = chordDetection.maxChordFeatures(chordFeatures, 2)
    const chordIndexes = chordDetection.getChordIndexes(maxChordFeatures)
    const medianBlurredChordIndexes = filter.maxFrequencyFilter(
      chordIndexes,
      24,
      blurLengthInSamples
    )
    const chords = chordDetection.getChords(medianBlurredChordIndexes)
    const prunedChords = []

    for (let i = 0; i < chords.length; i++) {
      const chord = chords[i]
      chord.start = chord.startSample * fastSampledPitchDuration
      chord.end = chord.endSample * fastSampledPitchDuration
      if (chord.end - chord.start < minChordDuration) {
        if (prunedChords.length > 0) {
          prunedChords[prunedChords.length - 1].endSample = chord.endSample
          prunedChords[prunedChords.length - 1].end = chord.end
        }
      } else {
        prunedChords.push(chord)
      }
    }

    // tonality feature
    const smallBlurredPitch = filter.gaussianBlurFeatures(fastSampledPitch, 5)
    const largeBlurredPitch = filter.gaussianBlurFeatures(fastSampledPitch, 75)
    const windowSize = 150

    const tonalityFeatureSmall = []
    const tonalityFeatureLarge = []

    const keyFeature = []
    for (let i = 0; i < smallBlurredPitch.length; i++) {
      tonalityFeatureSmall.push(keyDetection.detect2D(smallBlurredPitch[i]))
      tonalityFeatureLarge.push(keyDetection.detect2D(largeBlurredPitch[i]))

      keyFeature.push(
        keyDetection.detect(
          fastSampledPitch,
          Math.max(0, i - windowSize / 2),
          Math.min(fastSampledPitch.length - 1, i + windowSize / 2)
        )
      )
    }

    return {
      chords: prunedChords,
      chordsVector: maxChordFeatures,
      key: key,
      tonalityFeatureSmall,
      tonalityFeatureLarge,
      keyFeature,
    }
  },
}

expose(obj)

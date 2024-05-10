import * as audioUtil from './audioUtil'

export default class SpotifySegment {
  segment = null
  start = 0
  duration = 0
  loudness_start = 0
  loudness_max_time = 0
  loudness_max = 0
  loudness_end = 0

  pitches = []
  noise = []
  timbres = []
  timbresScaled = []

  cluster = -1
  tsneCoord = [0, 0]

  tonalityAngle = 0 // [0,1] Angle of vector on circle of fifths
  tonalityRadius = 0 // [0,1] Radius of vector on circle of fifths, low value means very dissonant or atonal
  tonalityEnergy = 0 // [0,1] Total energy of all the pitches, high energy means lots of notes played at the same time

  percussiony = 0 // [0,1] segments larger than .15

  constructor(segment) {
    this.segment = segment
    this.start = segment.start
    this.duration = segment.duration
    this.loudness_start = segment.loudness_start
    this.loudness_max = segment.loudness_max
    this.loudness_max_time = segment.loudness_max_time
    this.loudness_end = segment.loudness_end
    this.processPitch()
  }

  processedPitch = false
  processedPitchSmooth = false
  processPitch() {
    if (this.processedPitch) return

    this.segment.pitches.forEach((pitch) => {
      this.pitches.push(pitch)
    })
    ;[this.tonalityAngle, this.tonalityRadius, this.tonalityEnergy] =
      audioUtil.tonality(this.pitches)

    const minDuration = 0.2
    const decay = 0.5
    const shortness =
      this.duration < minDuration ? 1 : decay - (this.duration - 0.15)

    for (let p = 0; p < 12; p++) {
      this.noise.push(
        Math.max(
          0,
          this.pitches[(p + 11) % 12] +
            this.pitches[p] +
            this.pitches[(p + 1) % 12] -
            2
        )
      )
    }

    // this.percussiony = Math.max(Math.min(1, (1 - this.tonalityRadius) * this.tonalityEnergy * 2) * shortness, 0)
    // this.percussiony = Math.max(0, Math.min(1, 1 - this.tonalityRadius * 6))
    // this.percussiony = Math.max(0, Math.min(1, (1 - this.tonalityRadius) * this.tonalityEnergy))

    this.percussiony = this.noise.reduce((sum, val) => sum + val / 12) * 2
    this.processedPitch = true
  }

  processedTimbre = false
  processTimbre(min, max, biggest, totalBiggest) {
    if (this.processedTimbre) return

    this.segment.timbre.forEach((timbre) => {
      this.timbres.push(timbre / totalBiggest)
    })

    this.segment.timbre.forEach((timbre, i) => {
      this.timbresScaled.push(timbre / biggest[i])
    })
    this.processedTimbre = true
  }

  // GETTERS
  getPitches() {
    return this.pitches
  }
  getTimbres() {
    return this.timbres
  }
  getDuration() {
    return this.duration
  }
  getStart() {
    return this.start
  }
  getEnd() {
    return this.start + this.duration
  }
  getOriginalTimbres() {
    return this.segment.timbre
  }
  getFeatures() {
    return this.pitches.concat(this.timbres)
  }
  getTonalEnergy() {
    return this.tonalityEnergy
  }
  getTonalAngle() {
    return this.tonalityAngle
  }
  getLoudnessFeatures() {
    const start = audioUtil.loudnessPerceived(this.loudness_start)
    const max = audioUtil.loudnessPerceived(this.loudness_max)
    const end = audioUtil.loudnessPerceived(this.loudness_end)

    return [start, max, this.loudness_max_time, end]
  }
  getAverageLoudness(nextSegmentLoudness) {
    const loudnessFeatures = this.getLoudnessFeatures()
    const start = loudnessFeatures[0]
    const end = nextSegmentLoudness
    const max = loudnessFeatures[1]
    const maxTime = loudnessFeatures[2]

    const avgFirst = (max + start) / 2
    const avgSecond = (max + end) / 2
    const avg = avgFirst * maxTime + avgSecond * (1 - maxTime)

    return avg
  }

  // SETTERS
  setCluster(cluster) {
    this.cluster = cluster
  }
  setTSNECoord(coord) {
    this.tsneCoord = coord
  }
}

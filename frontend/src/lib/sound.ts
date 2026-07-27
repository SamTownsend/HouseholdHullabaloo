import bonusCorrectUrl from '../assets/audio/bonuscorrect.mp3'
import bonusIncorrectUrl from '../assets/audio/bonusincorrect.mp3'
import duplicateUrl from '../assets/audio/duplicate.mp3'
import revealUrl from '../assets/audio/reveal.mp3'
import strikeUrl from '../assets/audio/strike.mp3'
import timerUrl from '../assets/audio/timer.mp3'

export const Sounds = {
  BonusCorrect: 'bonusCorrect',
  BonusIncorrect: 'bonusIncorrect',
  Duplicate: 'duplicate',
  Reveal: 'reveal',
  Strike: 'strike',
  Timer: 'timer',
} as const
export type Sounds = (typeof Sounds)[keyof typeof Sounds]

const soundUrls: Record<Sounds, string> = {
  [Sounds.BonusCorrect]: bonusCorrectUrl,
  [Sounds.BonusIncorrect]: bonusIncorrectUrl,
  [Sounds.Duplicate]: duplicateUrl,
  [Sounds.Reveal]: revealUrl,
  [Sounds.Strike]: strikeUrl,
  [Sounds.Timer]: timerUrl,
}

const audioCache = new Map<Sounds, HTMLAudioElement>()

function getAudio(sound: Sounds): HTMLAudioElement {
  let audio = audioCache.get(sound)
  if (!audio) {
    audio = new Audio(soundUrls[sound])
    audio.preload = 'auto'
    audioCache.set(sound, audio)
  }

  return audio
}

export function preloadSounds(): void {
  Object.values(Sounds).forEach((sound) => getAudio(sound))
}

export function playSound(sound: Sounds): void {
  const audio = getAudio(sound)
  audio.currentTime = 0
  // fail silently on rejected playback
  void audio.play().catch(() => {})
}

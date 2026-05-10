// Common filler words to skip during tokenization
const STOPWORDS = new Set([
  'A',
  'ABOUT',
  'AN',
  'AND',
  'AS',
  'AT',
  'BY',
  'FOR',
  'FROM',
  'IN',
  'OF',
  'ON',
  'SOME',
  'THE',
  'TO',
])

// Maps spelled-out number words to their numeric value
const NUMBER_LOOKUP: Record<string, number> = {}

const CARDINALS = [
  'ZERO',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN',
]

const ORDINALS = [
  'ZEROTH',
  'FIRST',
  'SECOND',
  'THIRD',
  'FOURTH',
  'FIFTH',
  'SIXTH',
  'SEVENTH',
  'EIGHTH',
  'NINTH',
  'TENTH',
  'ELEVENTH',
  'TWELFTH',
  'THIRTEENTH',
  'FOURTEENTH',
  'FIFTEENTH',
  'SIXTEENTH',
  'SEVENTEENTH',
  'EIGHTEENTH',
  'NINETEENTH',
]

const TENS_CARDINALS = [
  'TWENTY',
  'THIRTY',
  'FORTY',
  'FIFTY',
  'SIXTY',
  'SEVENTY',
  'EIGHTY',
  'NINETY',
]

const TENS_ORDINALS = [
  'TWENTIETH',
  'THIRTIETH',
  'FORTIETH',
  'FIFTIETH',
  'SIXTIETH',
  'SEVENTIETH',
  'EIGHTIETH',
  'NINETIETH',
]

CARDINALS.forEach((w, i) => (NUMBER_LOOKUP[w] = i))
ORDINALS.forEach((w, i) => (NUMBER_LOOKUP[w] = i))
TENS_CARDINALS.forEach((w, i) => (NUMBER_LOOKUP[w] = (i + 2) * 10))
TENS_ORDINALS.forEach((w, i) => (NUMBER_LOOKUP[w] = (i + 2) * 10))
NUMBER_LOOKUP['HUNDRED'] = 100
NUMBER_LOOKUP['THOUSAND'] = 1000

// Return numeric value of word from lookup table, or null for non-numeric words
export function parseNumber(word: string): number | null {
  const val = NUMBER_LOOKUP[word.toUpperCase()]
  return val !== undefined ? val : null
}

const PUNCT_SPACE = new Set(['&', '-', '/'])
const PUNCT_REMOVE = new Set(['.', ':', '"', '\\'])

export function normalize(s: string): string {
  s = s.trim()
  const result: string[] = []

  // Process string character by character
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]

    // Replace these characters with a space
    if (PUNCT_SPACE.has(ch)) {
      result.push(' ')
    }
    // Only keep this character if it sits between two digit characters, which preserves
    // decimal points (Ex. "3.14") while dropping punctuation like the period in "Mr."
    else if (PUNCT_REMOVE.has(ch)) {
      const prevDigit = i > 0 && s[i - 1] >= '0' && s[i - 1] <= '9'
      const nextDigit = i + 1 < s.length && s[i + 1] >= '0' && s[i + 1] <= '9'
      if (prevDigit && nextDigit) result.push(ch)
    }
    // Keep all other characters
    else {
      result.push(ch)
    }
  }

  // Join, uppercase, collapse any runs of multiple spaces created by punctuation
  // replacement above, and trim again in case punctuation appeared at the edges.
  return result.join('').toUpperCase().replace(/ {2,}/g, ' ').trim()
}

export function tokenize(s: string): string[] {
  if (!s) {
    return []
  }

  // Split input into a word array, excluding stopwords
  s = s.toUpperCase()
  const rawWords = s.split(' ').filter((w) => !STOPWORDS.has(w))
  const tokens: string[] = []

  let i = 0
  while (i < rawWords.length && tokens.length < 20) {
    const word = rawWords[i]
    const numVal = parseNumber(word)

    // Number word detected. Consume as many consecutive number words as possible, accumulating their combined value.
    // Scale words (HUNDRED, THOUSAND) multiply the accumulator, smaller units add to it.
    // Ex: TWENTY THREE > 20+3 = 23, TWO HUNDRED > 2*100 = 200
    if (numVal !== null) {
      let accumulated = numVal
      let j = i + 1
      while (j < rawWords.length) {
        const nextVal = parseNumber(rawWords[j].toUpperCase())
        if (nextVal === null) {
          break
        }
        accumulated = nextVal >= 100 ? (accumulated *= nextVal) : (accumulated += nextVal)
        j++
      }
      tokens.push(String(accumulated))
      i = j
      continue
    }

    // Regular word
    tokens.push(word)
    i++
  }

  return tokens
}

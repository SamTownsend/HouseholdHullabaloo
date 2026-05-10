import { MatchType } from '../../types'

const SUFFIXES = [
  'ENINGS',
  'ENING',
  'INGS',
  'MENT',
  'NESS',
  'ENS',
  'ERS',
  'EST',
  'ING',
  'ION',
  'SES',
  'ED',
  'EE',
  'EN',
  'ER',
  'ES',
  'IE',
  'LY',
  'RS',
  'D',
  'E',
  'R',
  'S',
  '',
]

// Strips the longest matching suffix from a word, returning the stem.
// Only strips if the result would be at least one character long.
// This will obviously result in incredibly stupid behavior, but it's part of the original spec so whatever
export function stem(word: string): string {
  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length > suffix.length) {
      return word.slice(0, word.length - suffix.length)
    }
  }

  return word
}

const SYNONYM_PAIRS = new Map<string, Set<string>>([
  ['MONEY', new Set(['$', 'DOLLARS', 'DOLLAR', 'CASH', 'BUCK', 'BUCKS'])],
  ['DOLLARS', new Set(['$', 'MONEY', 'DOLLAR', 'CASH', 'BUCK', 'BUCKS'])],
  ['DOLLAR', new Set(['$', 'MONEY', 'DOLLARS', 'CASH', 'BUCK', 'BUCKS'])],
  ['CASH', new Set(['$', 'MONEY', 'DOLLARS', 'DOLLAR', 'BUCK', 'BUCKS'])],
  ['BUCK', new Set(['$', 'MONEY', 'DOLLARS', 'DOLLAR', 'CASH', 'BUCKS'])],
  ['BUCKS', new Set(['$', 'MONEY', 'DOLLARS', 'DOLLAR', 'CASH', 'BUCK'])],
  ['DR', new Set(['DOCTOR'])],
  ['MR', new Set(['MISTER'])],
  ['MRS', new Set(['MISSES', 'MS'])],
  ['MISSES', new Set(['MRS', 'MS'])],
  ['TV', new Set(['TELEVISION'])],
  ['XMAS', new Set(['CHRISTMAS'])],
  ['ACCT', new Set(['ACCOUNT'])],
  ['BLDG', new Set(['BUILDING'])],
  ['CAPT', new Set(['CAPTAIN'])],
  ['HR', new Set(['HOUR'])],
  ['HRS', new Set(['HOURS'])],
  ['JAN', new Set(['JANUARY'])],
  ['FEB', new Set(['FEBRUARY'])],
  ['MAR', new Set(['MARCH'])],
  ['APR', new Set(['APRIL'])],
  ['JUN', new Set(['JUNE'])],
  ['JUL', new Set(['JULY'])],
  ['AUG', new Set(['AUGUST'])],
  ['SEP', new Set(['SEPTEMBER'])],
  ['SEPT', new Set(['SEPTEMBER'])],
  ['OCT', new Set(['OCTOBER'])],
  ['NOV', new Set(['NOVEMBER'])],
  ['DEC', new Set(['DECEMBER'])],
  ['MON', new Set(['MONDAY'])],
  ['TUE', new Set(['TUESDAY'])],
  ['TUES', new Set(['TUESDAY'])],
  ['WED', new Set(['WEDNESDAY'])],
  ['THU', new Set(['THURSDAY'])],
  ['THUR', new Set(['THURSDAY'])],
  ['THURS', new Set(['THURSDAY'])],
  ['FRI', new Set(['FRIDAY'])],
  ['SAT', new Set(['SATURDAY'])],
  ['SUN', new Set(['SUNDAY'])],
  ['PERSON', new Set(['PEOPLE'])],
  ['CLOTHES', new Set(['CLOTHING'])],
])

// Returns true if a and b are considered synonyms per the synonym table.
// The check is bidirectional and also returns true for identical words.
export function synonymMatch(a: string, b: string): boolean {
  if (a === b) {
    return true
  }

  return (SYNONYM_PAIRS.get(a)?.has(b) ?? false) || (SYNONYM_PAIRS.get(b)?.has(a) ?? false)
}

// Returns true if a and b differ by at most one character substitution
// or insertion/deletion. Only applied to words of 4 or more characters,
// and never to words beginning with a digit.
export function oneCharDiff(a: string, b: string): boolean {
  if (a[0] !== undefined && /\d/.test(a[0])) return false
  if (b[0] !== undefined && /\d/.test(b[0])) return false

  const la = a.length
  const lb = b.length
  if (Math.abs(la - lb) > 1) return false
  if (Math.min(la, lb) < 4) return false

  if (la === lb) {
    // Equal length: count mismatching character positions
    const diffs = [...a].filter((ch, i) => ch !== b[i]).length
    return diffs <= 1
  }

  // Length difference of 1: try removing each character from the longer word
  // and check if the result equals the shorter word
  const [shorter, longer] = la < lb ? [a, b] : [b, a]
  for (let skip = 0; skip < longer.length; skip++) {
    if (longer.slice(0, skip) + longer.slice(skip + 1) === shorter) return true
  }

  return false
}

// Computes the length of the longest common subsequence of a and b.
function lcsLength(a: string, b: string): number {
  const m = a.length
  const n = b.length
  let prev = new Array<number>(n + 1).fill(0)

  for (let i = 0; i < m; i++) {
    const curr = new Array<number>(n + 1).fill(0)
    for (let j = 0; j < n; j++) {
      curr[j + 1] = a[i] === b[j] ? prev[j] + 1 : Math.max(curr[j], prev[j + 1])
    }
    prev = curr
  }

  return prev[n]
}

const LCS_RATIO_THRESHOLD = 80

// Returns 80 if the LCS covers more than 80% of the shorter word, 0 otherwise
export function lcsScore(a: string, b: string): number {
  const minLen = Math.min(a.length, b.length)
  if (minLen === 0) {
    return 0
  }

  const lcs = lcsLength(a, b)
  if (lcs * 100 <= minLen * LCS_RATIO_THRESHOLD) {
    return 0
  }

  return 80
}

// Scores how well a single stored word matches a single user word.
// Nonsensical scoring system, result can be either 100, 99, 90, 80, or 0.
// Presumably will get more complicated for multi-word answers wherever this is called from.
export function scorePair(wordA: string, wordB: string, matchType: MatchType): number {
  // exact match
  if (wordA === wordB) {
    return 100
  }

  // synonym
  if (synonymMatch(wordA, wordB)) {
    return 90
  }

  // Fuzzy evaluation skipped in exact mode
  if (matchType === MatchType.Exact) {
    return 0
  }

  // suffix stemming
  if (stem(wordA) === stem(wordB)) return 100

  // one character difference
  if (oneCharDiff(wordA, wordB)) return 99

  // LCS partial score for close but not exact matches
  return lcsScore(wordA, wordB)
}

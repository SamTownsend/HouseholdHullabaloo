import { describe, it, expect } from 'vitest'
import { stem, synonymMatch, oneCharDiff, lcsScore, scorePair } from './wordScore'
import { MatchTypes } from '../../types'

describe('stem', () => {
  it.each([
    ['DEAFENINGS', 'DEAF'],
    ['STRENGTHENING', 'STRENGTH'],
    ['BUILDINGS', 'BUILD'],
    ['AGREEMENT', 'AGREE'],
    ['KINDNESS', 'KIND'],
    ['SHARPENS', 'SHARP'],
    ['SWINGERS', 'SWING'],
    ['GREATEST', 'GREAT'],
    ['READING', 'READ'],
    ['CELEBRATION', 'CELEBRAT'],
    ['DIAGNOSES', 'DIAGNO'],
    ['JUMPED', 'JUMP'],
    ['EMPLOYEE', 'EMPLOY'],
    ['SHARPEN', 'SHARP'],
    ['SWINGER', 'SWING'],
    ['TOMATOES', 'TOMATO'],
    ['SOFTIE', 'SOFT'],
    ['SLOWLY', 'SLOW'],
    ['YOURS', 'YOU'],
    ['ACCORD', 'ACCOR'],
    ['AMAZE', 'AMAZ'],
    ['ARMOR', 'ARMO'],
    ['FRIENDS', 'FRIEND'],
    ['CAT', 'CAT'],
  ])('stem(%s) returns %s', (input, expected) => {
    expect(stem(input)).toBe(expected)
  })
})

describe('synonymMatch', () => {
  it('returns true for identical words', () => {
    expect(synonymMatch('CAT', 'CAT')).toBe(true)
  })

  it.each([
    ['TV', 'TELEVISION'],
    ['DR', 'DOCTOR'],
    ['XMAS', 'CHRISTMAS'],
    ['$', 'DOLLARS'],
    ['MRS', 'MISSES'],
  ])('synonymMatch(%s, %s) returns true', (a, b) => {
    expect(synonymMatch(a, b)).toBe(true)
  })

  it.each([
    ['TV', 'TELEVISION'],
    ['DR', 'DOCTOR'],
    ['XMAS', 'CHRISTMAS'],
    ['$', 'DOLLARS'],
    ['MRS', 'MISSES'],
  ])('is bidirectional (%s, %s)', (a, b) => {
    expect(synonymMatch(a, b)).toBe(true)
    expect(synonymMatch(b, a)).toBe(true)
  })

  it('returns false for unrelated words', () => {
    expect(synonymMatch('CAT', 'DOG')).toBe(false)
  })
})

describe('oneCharDiff', () => {
  it('returns true for equal-length words differing by one character', () => {
    expect(oneCharDiff('SLEEP', 'SHEEP')).toBe(true)
  })

  it('returns true for words differing by one insertion', () => {
    expect(oneCharDiff('CARD', 'CARDS')).toBe(true)
  })

  it('returns false for words shorter than 4 characters', () => {
    expect(oneCharDiff('CAT', 'BAT')).toBe(false)
  })

  it('returns false for words starting with a digit', () => {
    expect(oneCharDiff('3RD', '4RD')).toBe(false)
  })

  it('returns false for words differing by more than one character', () => {
    expect(oneCharDiff('SLEEP', 'AWAKE')).toBe(false)
  })

  it('returns false when length difference is greater than 1', () => {
    expect(oneCharDiff('CAT', 'CATCH')).toBe(false)
  })
})

describe('lcsScore', () => {
  it('returns 0 for empty strings', () => {
    expect(lcsScore('', '')).toBe(0)
  })

  it('returns 0 when LCS covers 80% or less of the shorter word', () => {
    expect(lcsScore('TELLY', 'TELEVISION')).toBe(0)
  })

  it('returns a positive score for closely matching words', () => {
    expect(lcsScore('COLOUR', 'COLOR')).toBeGreaterThan(0)
  })

  it('returns 80 for identical words', () => {
    expect(lcsScore('SLEEP', 'SLEEP')).toBe(80)
  })
})

describe('scorePair', () => {
  it('returns 100 for an exact match', () => {
    expect(scorePair('SLEEP', 'SLEEP', MatchTypes.Fuzzy)).toBe(100)
  })

  it('returns 100 for a stem match', () => {
    expect(scorePair('SLEEPING', 'SLEEP', MatchTypes.Fuzzy)).toBe(100)
  })

  it('returns 99 for a one-character-difference match', () => {
    expect(scorePair('SLEEP', 'SHEEP', MatchTypes.Fuzzy)).toBe(99)
  })

  it('returns 90 for a synonym match', () => {
    expect(scorePair('TV', 'TELEVISION', MatchTypes.Fuzzy)).toBe(90)
  })

  it('returns 0 for unrelated words', () => {
    expect(scorePair('SLEEP', 'AWAKE', MatchTypes.Fuzzy)).toBe(0)
  })

  it('returns 0 for a stem match in exact mode', () => {
    expect(scorePair('SLEEPING', 'SLEEP', MatchTypes.Exact)).toBe(0)
  })

  it('returns 0 for a one-char-diff match in exact mode', () => {
    expect(scorePair('SLEEP', 'SHEEP', MatchTypes.Exact)).toBe(0)
  })
})

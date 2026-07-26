import { describe, it, expect } from 'vitest'
import {
  getFinalScore,
  getRoundMultiplier,
  getMultiplierLabel,
  getModifiedRoundResult,
} from './scoring'
import type { RoundSummary } from '../types'

describe('getFinalScore', () => {
  it('returns the normal round score when bonus round was not played', () => {
    expect(getFinalScore(1000, 0)).toBe(1000)
  })

  it('multiplies the bonus score by 5 when the bonus round was lost', () => {
    expect(getFinalScore(1000, 100)).toBe(1000 + 500)
  })

  it('is inclusive of the 200 point win threshold', () => {
    expect(getFinalScore(0, 199)).toBe(199 * 5)
    expect(getFinalScore(0, 200)).toBe(200 + 20000)
  })

  it('adds a flat 20,000 point bonus when the bonus round was won', () => {
    expect(getFinalScore(1000, 250)).toBe(1000 + 250 + 20000)
  })
})

describe('getRoundMultiplier', () => {
  it.each([
    [0, 1],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
  ])('getRoundMultiplier(%i) returns %i', (roundIndex, expected) => {
    expect(getRoundMultiplier(roundIndex)).toBe(expected)
  })
})

describe('getMultiplierLabel', () => {
  it('returns an empty string for a multiplier of 1 or less', () => {
    expect(getMultiplierLabel(1)).toBe('')
    expect(getMultiplierLabel(0)).toBe('')
  })

  it('returns DOUBLE POINTS for a multiplier of 2', () => {
    expect(getMultiplierLabel(2)).toBe('DOUBLE POINTS')
  })

  it('returns TRIPLE POINTS for a multiplier of 3', () => {
    expect(getMultiplierLabel(3)).toBe('TRIPLE POINTS')
  })

  it('falls back to "<N>X POINTS" for multipliers above 3', () => {
    expect(getMultiplierLabel(4)).toBe('4X POINTS')
    expect(getMultiplierLabel(10)).toBe('10X POINTS')
  })
})

describe('getModifiedRoundResult', () => {
  const baseSummary: RoundSummary = {
    questionId: 1,
    roundScore: 100,
    averageScore: 50,
    strikes: 0,
  }

  it('applies the round multiplier and unused-strike bonus to the round score', () => {
    const result = getModifiedRoundResult({ ...baseSummary, strikes: 1 }, 2)
    // roundScore: 100 * 2 = 200, plus 10 * (3 - 1) = 20 => 220
    expect(result.roundScore).toBe(220)
  })

  it('scales the average score by the round multiplier and difficulty modifier', () => {
    // averageScore (50) * multiplier (1) = 50, which is below roundScore (100 + 30 = 130)
    // so it is NOT averaged with roundScore, just scaled by the 0.9 difficulty mod
    const result = getModifiedRoundResult(baseSummary, 1)
    expect(result.roundScore).toBe(130)
    expect(result.averageScore).toBe(Math.floor(50 * 0.9))
  })

  it('averages the scaled average score with the round score when it would otherwise exceed it', () => {
    const summary: RoundSummary = { ...baseSummary, roundScore: 10, averageScore: 500, strikes: 3 }
    const roundIndex = 1
    // roundScore: 10 * 1 = 10, plus 10 * (3 - 3) = 0 => 10
    // averageScore before averaging: 500 * 1 = 500, which exceeds roundScore (10)
    // averaged: (500 + 10) / 2 = 255, then floored * 0.9
    const result = getModifiedRoundResult(summary, roundIndex)
    expect(result.roundScore).toBe(10)
    expect(result.averageScore).toBe(Math.floor(255 * 0.9))
  })
})

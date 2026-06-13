import { describe, it, expect } from 'vitest'
import { surveySays } from './surveySays'
import { MatchTypes, type AnswerGroup, HarvOutcomes } from '../../types'

const testGroups: AnswerGroup[] = [
  {
    rank: 1,
    revealed: false,
    pointValue: 40,
    displayText: 'FAIRY',
    answers: [
      { matchType: MatchTypes.Fuzzy, answerText: 'FAIRY', forbiddenWords: ['DUST'] },
      { matchType: MatchTypes.Fuzzy, answerText: 'PIXIE', forbiddenWords: [] },
    ],
  },
  {
    rank: 2,
    revealed: false,
    pointValue: 30,
    displayText: 'FAIRY DUST',
    answers: [
      { matchType: MatchTypes.Fuzzy, answerText: 'FAIRY DUST', forbiddenWords: [] },
      { matchType: MatchTypes.Fuzzy, answerText: 'DUST', forbiddenWords: [] },
    ],
  },
  {
    rank: 3,
    revealed: false,
    pointValue: 20,
    displayText: 'FAIRY',
    answers: [
      { matchType: MatchTypes.Fuzzy, answerText: 'FAIRY', forbiddenWords: ['DUST'] },
      { matchType: MatchTypes.Fuzzy, answerText: 'PIXIE', forbiddenWords: [] },
    ],
  },
]

const partiallyRevealedGroups: AnswerGroup[] = [
  { ...testGroups[0], revealed: true },
  { ...testGroups[1], revealed: true },
  { ...testGroups[2], revealed: false },
]

const fullyRevealedGroups: AnswerGroup[] = testGroups.map((g) => ({ ...g, revealed: true }))

describe('surveySays', () => {
  it('returns correct for a matching unrevealed group', () => {
    const result = surveySays(testGroups, 'fairy')
    expect(result.outcome).toBe(HarvOutcomes.Correct)
    expect(result.matchedIndex).toBe(0)
  })

  it('matches the correct group based on answer content', () => {
    const result = surveySays(testGroups, 'dust')
    expect(result.outcome).toBe(HarvOutcomes.Correct)
    expect(result.matchedIndex).toBe(1)
  })

  it('respects forbidden words', () => {
    const result = surveySays(testGroups, 'fairy dust')
    expect(result.outcome).toBe(HarvOutcomes.Correct)
    expect(result.matchedIndex).toBe(1)
  })

  it('returns incorrect for an unrecognised guess', () => {
    const result = surveySays(testGroups, 'dragon')
    expect(result.outcome).toBe(HarvOutcomes.Incorrect)
  })

  it('returns incorrect for an empty guess', () => {
    const result = surveySays(testGroups, '')
    expect(result.outcome).toBe(HarvOutcomes.Incorrect)
  })

  it('returns duplicate when match has already been revealed', () => {
    const result = surveySays(partiallyRevealedGroups, 'dust')
    expect(result.outcome).toBe(HarvOutcomes.Duplicate)
  })

  it('returns correct for an unrevealed match even when a revealed match exists', () => {
    const result = surveySays(partiallyRevealedGroups, 'fairy')
    expect(result.outcome).toBe(HarvOutcomes.Correct)
    expect(result.matchedIndex).toBe(2)
  })

  it('returns duplicate when all matching groups are revealed', () => {
    const result = surveySays(fullyRevealedGroups, 'fairy')
    expect(result.outcome).toBe(HarvOutcomes.Duplicate)
  })
})

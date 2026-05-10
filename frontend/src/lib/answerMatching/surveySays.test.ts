import { describe, it, expect } from 'vitest'
import { surveySays } from './surveySays'
import { MatchTypes, type Question, HarvOutcomes } from '../../types'

const testQuestion: Question = {
  _id: 1,
  round: 1,
  questionPack: 1,
  questionText: 'Name something associated with Tinkerbell.',
  averageScore: 50,
  answerGroups: [
    {
      rank: 1,
      points: 40,
      revealed: false,
      displayText: 'FAIRY',
      answers: [
        { matchType: MatchTypes.Fuzzy, answerText: 'FAIRY', forbiddenWords: ['DUST'] },
        { matchType: MatchTypes.Fuzzy, answerText: 'PIXIE', forbiddenWords: [] },
      ],
    },
    {
      rank: 2,
      points: 30,
      revealed: false,
      displayText: 'FAIRY DUST',
      answers: [
        { matchType: MatchTypes.Fuzzy, answerText: 'FAIRY DUST', forbiddenWords: [] },
        { matchType: MatchTypes.Fuzzy, answerText: 'DUST', forbiddenWords: [] },
      ],
    },
    {
      rank: 3,
      points: 20,
      revealed: false,
      displayText: 'FAIRY',
      answers: [
        { matchType: MatchTypes.Fuzzy, answerText: 'FAIRY', forbiddenWords: ['DUST'] },
        { matchType: MatchTypes.Fuzzy, answerText: 'PIXIE', forbiddenWords: [] },
      ],
    },
  ],
}

const partiallyRevealedQuestion: Question = {
  ...testQuestion,
  answerGroups: [
    { ...testQuestion.answerGroups[0], revealed: true },
    { ...testQuestion.answerGroups[1], revealed: true },
    { ...testQuestion.answerGroups[2], revealed: false },
  ],
}

const fullyRevealedQuestion: Question = {
  ...testQuestion,
  answerGroups: testQuestion.answerGroups.map((g) => ({ ...g, revealed: true })),
}

describe('surveySays', () => {
  it('returns correct for a matching unrevealed group', () => {
    const result = surveySays(testQuestion, 'fairy')
    expect(result.outcome).toBe(HarvOutcomes.Correct)
    expect(result.matchedIndex).toBe(0)
  })

  it('matches the correct group based on answer content', () => {
    const result = surveySays(testQuestion, 'dust')
    expect(result.outcome).toBe(HarvOutcomes.Correct)
    expect(result.matchedIndex).toBe(1)
  })

  it('respects forbidden words', () => {
    const result = surveySays(testQuestion, 'fairy dust')
    expect(result.outcome).toBe(HarvOutcomes.Correct)
    expect(result.matchedIndex).toBe(1)
  })

  it('returns incorrect for an unrecognised guess', () => {
    const result = surveySays(testQuestion, 'dragon')
    expect(result.outcome).toBe(HarvOutcomes.Incorrect)
  })

  it('returns incorrect for an empty guess', () => {
    const result = surveySays(testQuestion, '')
    expect(result.outcome).toBe(HarvOutcomes.Incorrect)
  })

  it('returns duplicate when match has already been revealed', () => {
    const result = surveySays(partiallyRevealedQuestion, 'dust')
    expect(result.outcome).toBe(HarvOutcomes.Duplicate)
  })

  it('returns correct for an unrevealed match even when a revealed match exists', () => {
    const result = surveySays(partiallyRevealedQuestion, 'fairy')
    expect(result.outcome).toBe(HarvOutcomes.Correct)
    expect(result.matchedIndex).toBe(2)
  })

  it('returns duplicate when all matching groups are revealed', () => {
    const result = surveySays(fullyRevealedQuestion, 'fairy')
    expect(result.outcome).toBe(HarvOutcomes.Duplicate)
  })
})

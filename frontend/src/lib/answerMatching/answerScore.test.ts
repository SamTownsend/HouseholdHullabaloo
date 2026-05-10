import { describe, it, expect } from 'vitest'
import { coreCompare, scoreAnswer } from './answerScore'
import { MatchTypes, type AnswerGroup } from '../../types'

describe('coreCompare', () => {
  it('returns a positive score when user input matches answer', () => {
    expect(coreCompare('FAIRY', ['FAIRY'], MatchTypes.Fuzzy)).toBeGreaterThan(0)
  })

  it('returns 0 when user input does not match answer', () => {
    expect(coreCompare('FAIRY', ['DRAGON'], MatchTypes.Fuzzy)).toBe(0)
  })

  it('returns 0 for empty answer text', () => {
    expect(coreCompare('', ['FAIRY'], MatchTypes.Fuzzy)).toBe(0)
  })

  it('returns 0 for empty user input', () => {
    expect(coreCompare('FAIRY', [], MatchTypes.Fuzzy)).toBe(0)
  })

  it('handles multi-word answers', () => {
    expect(coreCompare('FAIRY DUST', ['FAIRY', 'DUST'], MatchTypes.Fuzzy)).toBeGreaterThan(0)
  })

  it('returns 0 for incomplete multi-word match', () => {
    expect(coreCompare('FAIRY DUST', ['FAIRY'], MatchTypes.Fuzzy)).toBe(0)
  })

  it('does not stem match in exact mode', () => {
    expect(coreCompare('SLEEPING', ['SLEEP'], MatchTypes.Exact)).toBe(0)
  })

  it('allows a token length difference of exactly 1', () => {
    expect(coreCompare('WEAK', ['HES', 'WEAK'], MatchTypes.Fuzzy)).toBeGreaterThan(0)
  })

  it('returns 0 when user tokens exceed answer tokens by more than 1', () => {
    expect(coreCompare('FAIRY', ['FAIRY', 'DUST', 'MAGIC'], MatchTypes.Fuzzy)).toBe(0)
  })

  it('returns 0 when answer tokens exceed user tokens by more than 1', () => {
    expect(coreCompare('PETER PAN MOVIE', ['PETER'], MatchTypes.Fuzzy)).toBe(0)
  })
})

describe('matchAnswer', () => {
  const fairyGroup: AnswerGroup = {
    rank: 1,
    points: 10,
    revealed: false,
    displayText: 'FAIRY',
    answers: [
      { matchType: MatchTypes.Fuzzy, answerText: 'FAIRY', forbiddenWords: [] },
      { matchType: MatchTypes.Fuzzy, answerText: 'PIXIE', forbiddenWords: [] },
    ],
  }

  const exactGroup: AnswerGroup = {
    rank: 2,
    points: 10,
    revealed: false,
    displayText: 'SODA',
    answers: [{ matchType: MatchTypes.Exact, answerText: 'SODA', forbiddenWords: [] }],
  }

  const forbiddenGroup: AnswerGroup = {
    rank: 3,
    points: 10,
    revealed: false,
    displayText: 'FAIRY',
    answers: [{ matchType: MatchTypes.Fuzzy, answerText: 'FAIRY', forbiddenWords: ['DUST'] }],
  }

  it('matches a fuzzy answer', () => {
    expect(scoreAnswer(fairyGroup, 'fairy')).toBeGreaterThan(0)
  })

  it('matches any answer in the group', () => {
    expect(scoreAnswer(fairyGroup, 'pixie')).toBeGreaterThan(0)
  })

  it('matches an exact answer with exact input', () => {
    expect(scoreAnswer(exactGroup, 'soda')).toBeGreaterThan(0)
  })

  it('does not match an exact answer with a stemmed input', () => {
    expect(scoreAnswer(exactGroup, 'sodas')).toBe(0)
  })

  it('returns 0 when no answers match', () => {
    expect(scoreAnswer(fairyGroup, 'dragon')).toBe(0)
  })

  it('returns 0 when a forbidden word is present in user input', () => {
    expect(scoreAnswer(forbiddenGroup, 'fairy dust')).toBe(0)
  })

  it('matches when the forbidden word is absent from user input', () => {
    expect(scoreAnswer(forbiddenGroup, 'fairy')).toBeGreaterThan(0)
  })

  it('does not block a fuzzy variant of a forbidden word', () => {
    expect(scoreAnswer(forbiddenGroup, 'fairy dusting')).toBeGreaterThan(0)
  })
})

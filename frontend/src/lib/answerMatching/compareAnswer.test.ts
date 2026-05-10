import { describe, it, expect } from 'vitest'
import { coreCompare, matchAnswer } from './compareAnswer'
import { MatchType, type AnswerGroup } from '../../types'

describe('coreCompare', () => {
  it('returns a positive score when user input matches stored text', () => {
    expect(coreCompare('FAIRY', ['FAIRY'], MatchType.Fuzzy)).toBeGreaterThan(0)
  })

  it('returns 0 when user input does not match stored text', () => {
    expect(coreCompare('FAIRY', ['DRAGON'], MatchType.Fuzzy)).toBe(0)
  })

  it('returns 0 for empty stored text', () => {
    expect(coreCompare('', ['FAIRY'], MatchType.Fuzzy)).toBe(0)
  })

  it('returns 0 for empty user tokens', () => {
    expect(coreCompare('FAIRY', [], MatchType.Fuzzy)).toBe(0)
  })

  it('handles multi-word stored answers — all words must contribute', () => {
    expect(coreCompare('FAIRY DUST', ['FAIRY', 'DUST'], MatchType.Fuzzy)).toBeGreaterThan(0)
  })

  it('scores lower when only some words of a multi-word answer match', () => {
    const fullMatch = coreCompare('FAIRY DUST', ['FAIRY', 'DUST'], MatchType.Fuzzy)
    const partial = coreCompare('FAIRY DUST', ['FAIRY'], MatchType.Fuzzy)
    expect(partial).toBeLessThan(fullMatch)
  })

  it('does not stem match in exact mode', () => {
    expect(coreCompare('SLEEPING', ['SLEEP'], MatchType.Exact)).toBe(0)
  })
})

describe('matchAnswer', () => {
  const fairyGroup: AnswerGroup = {
    rank: 1,
    points: 10,
    revealed: false,
    displayText: 'FAIRY',
    answers: [
      { matchType: MatchType.Fuzzy, answerText: 'FAIRY', forbiddenWords: [] },
      { matchType: MatchType.Fuzzy, answerText: 'PIXIE', forbiddenWords: [] },
    ],
  }

  const exactGroup: AnswerGroup = {
    rank: 2,
    points: 10,
    revealed: false,
    displayText: 'SODA',
    answers: [{ matchType: MatchType.Exact, answerText: 'SODA', forbiddenWords: [] }],
  }

  const forbiddenGroup: AnswerGroup = {
    rank: 3,
    points: 10,
    revealed: false,
    displayText: 'FAIRY',
    answers: [{ matchType: MatchType.Fuzzy, answerText: 'FAIRY', forbiddenWords: ['DUST'] }],
  }

  it('matches a fuzzy answer', () => {
    expect(matchAnswer(fairyGroup, 'fairy')).toBeGreaterThan(0)
  })

  it('matches any answer in the group', () => {
    expect(matchAnswer(fairyGroup, 'pixie')).toBeGreaterThan(0)
  })

  it('matches an exact answer with exact input', () => {
    expect(matchAnswer(exactGroup, 'soda')).toBeGreaterThan(0)
  })

  it('does not match an exact answer with a stemmed input', () => {
    expect(matchAnswer(exactGroup, 'sodas')).toBe(0)
  })

  it('returns 0 when no answers match', () => {
    expect(matchAnswer(fairyGroup, 'dragon')).toBe(0)
  })

  it('returns 0 when a forbidden word is present in user input', () => {
    expect(matchAnswer(forbiddenGroup, 'fairy dust')).toBe(0)
  })

  it('matches when the forbidden word is absent from user input', () => {
    expect(matchAnswer(forbiddenGroup, 'fairy')).toBeGreaterThan(0)
  })

  it('does not block a fuzzy variant of a forbidden word', () => {
    expect(matchAnswer(forbiddenGroup, 'fairy dusting')).toBeGreaterThan(0)
  })
})

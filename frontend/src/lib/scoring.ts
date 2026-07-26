import type { RoundSummary } from '../types'

// TODO make this configurable from Options menu, ex. difficulty = easy / medium / hard
// Can add it as an additional parameter to getModifiedRoundResult
const AVERAGE_SCORE_DIFFICULTY_MOD = 0.9

export function getRoundMultiplier(roundIndex: number): number {
  // Double points in the penultimate round and triple in the final round
  return Math.max(roundIndex, 1)
}

export function getMultiplierLabel(multiplier: number): string {
  if (multiplier <= 1) return ''
  if (multiplier === 2) return 'DOUBLE POINTS'
  if (multiplier === 3) return 'TRIPLE POINTS'
  return `${multiplier}X POINTS`
}

export interface ModifiedRoundResult {
  roundScore: number
  averageScore: number
}

export function getModifiedRoundResult(
  summary: RoundSummary,
  roundIndex: number
): ModifiedRoundResult {
  const roundMultiplier = getRoundMultiplier(roundIndex)

  // Player earns 10 bonus points for each unused strike
  let roundScore = summary.roundScore * roundMultiplier
  roundScore += 10 * (3 - summary.strikes)

  // The default "average score" formula is way too brutal and needs to be toned down.
  // Only if it's greater, average the average score with the player's score
  let averageScore = summary.averageScore * roundMultiplier
  if (averageScore > roundScore) {
    averageScore = (averageScore + roundScore) / 2
  }
  averageScore = Math.floor(averageScore * AVERAGE_SCORE_DIFFICULTY_MOD)

  return { roundScore, averageScore }
}

export function getFinalScore(score: number, bonusScore: number): number {
  /*
    Scenario 1: Player missed the bonus round   > normal round score only
    Scenario 2: Player lost the bonus round     > normal round score + bonus round score * 5
    Scenario 3: Player won the bonus round      > normal round score + bonus round score + 20,000
  */
  return score + (bonusScore < 200 ? bonusScore * 5 : bonusScore + 20000)
}

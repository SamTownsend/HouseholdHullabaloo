import { HarvOutcomes } from '../../types'
import type { AnswerGroup, HarvJudgement } from '../../types'
import { scoreAnswer } from './answerScore'

export function surveySays(answerGroups: AnswerGroup[], userInput: string): HarvJudgement {
  if (!userInput.trim()) {
    return {
      outcome: HarvOutcomes.Incorrect,
      matchedIndex: -1,
    }
  }

  let duplicateFound = false
  let bestIndex = -1
  let bestScore = 0

  for (let i = 0; i < answerGroups.filter((g) => g.rank > 0).length; i++) {
    const group = answerGroups[i]
    const score = scoreAnswer(group, userInput)

    // Failed to match this group, keep going
    if (score === 0) {
      continue
    }

    if (!group.revealed) {
      // Track the highest-scoring unrevealed match, preferring the higher-ranked group on ties
      if (score > bestScore) {
        bestScore = score
        bestIndex = i
      }
    }
    // Duplicate match, keep going but flag duplicate
    else {
      duplicateFound = true
    }
  }

  if (bestIndex !== -1) {
    return {
      outcome: HarvOutcomes.Correct,
      matchedIndex: bestIndex,
    }
  }

  return {
    outcome: duplicateFound ? HarvOutcomes.Duplicate : HarvOutcomes.Incorrect,
    matchedIndex: -1,
  }
}

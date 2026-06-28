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

  for (let i = 0; i < answerGroups.filter((g) => g.rank > 0).length; i++) {
    const group = answerGroups[i]
    const score = scoreAnswer(group, userInput)

    // Failed to match this group, keep going
    if (score === 0) {
      continue
    }

    // Correct match
    if (!group.revealed) {
      return {
        outcome: HarvOutcomes.Correct,
        matchedIndex: i,
      }
    }

    // Duplicate match, keep going but flag duplicate
    duplicateFound = true
  }

  return {
    outcome: duplicateFound ? HarvOutcomes.Duplicate : HarvOutcomes.Incorrect,
    matchedIndex: -1,
  }
}

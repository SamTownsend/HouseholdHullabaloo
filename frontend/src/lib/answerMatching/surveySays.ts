import { HarvOutcomes } from '../../types'
import type { Question, HarvJudgement } from '../../types'
import { scoreAnswer } from './answerScore'

export function surveySays(question: Question, userInput: string): HarvJudgement {
  let duplicateFound = false

  for (let i = 0; i < question.answerGroups.length; i++) {
    const group = question.answerGroups[i]
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

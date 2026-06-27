export function getPackDisplayName(questionPack: number): string {
  const names: Record<number, string> = {
    1: 'Question Pack 1',
    2: 'Question Pack 2',
    3: 'Question Pack 3',
    4: 'This Whole Thing Smacks Of Gender Pack',
    5: '~300 Holiday(ish) Themed Questions',
    6: 'The Absolute Cinema Pack',
  }

  return names[questionPack] ?? `Question Pack ${questionPack}`
}

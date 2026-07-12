export function getFinalScore(score: number, bonusScore: number): number {
  /*
    Scenario 1: Player missed the bonus round   > normal round score only
    Scenario 2: Player lost the bonus round     > normal round score + bonus round score * 5
    Scenario 3: Player won the bonus round      > normal round score + bonus round score + 20,000
  */
  return score + (bonusScore < 200 ? bonusScore * 5 : bonusScore + 20000)
}

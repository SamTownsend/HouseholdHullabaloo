import { describe, it, expect } from 'vitest'
import {
  primeFactors,
  computeA,
  deriveC,
  nextIndex,
  pickWeightedPack,
  drawNextQuestion,
  selectNormalRoundQuestions,
} from './questionSelection.js'
import type { PackRange } from './packRanges.js'
import type { QuestionPackConfig } from './types.js'

function gcdForTest(a: number, b: number): number {
  while (b !== 0) {
    ;[a, b] = [b, a % b]
  }
  return a
}

describe('primeFactors', () => {
  it.each([
    [2300, [2, 5, 23]],
    [97, [97]],
    [1, []],
  ])('returns %j for primeFactors(%i)', (n, expected) => {
    expect(primeFactors(n)).toEqual(expected)
  })
})

const PACK_SIZES = [2300, 2194, 2800, 1522, 294, 985, 2, 3, 4, 5, 7, 15, 16, 97]

describe('computeA', () => {
  it.each(PACK_SIZES)('satisfies Hull-Dobell and avoids a=1 for m=%i', (m) => {
    const a = computeA(m)
    expect(a).toBeGreaterThan(1)
    for (const p of primeFactors(m)) {
      expect((a - 1) % p).toBe(0)
    }
    if (m % 4 === 0) {
      expect((a - 1) % 4).toBe(0)
    }
  })
})

describe('deriveC', () => {
  it.each(PACK_SIZES)('produces a value coprime with m=%i', (m) => {
    const c = deriveC('player-a', 1, m)
    expect(gcdForTest(c, m)).toBe(1)
  })

  it('differs across players and packs', () => {
    const c1 = deriveC('player-a', 1, 2300)
    const c2 = deriveC('player-b', 1, 2300)
    const c3 = deriveC('player-a', 2, 2300)
    expect(c1).not.toBe(c2)
    expect(c1).not.toBe(c3)
  })

  it('is deterministic for the same inputs', () => {
    expect(deriveC('player-a', 1, 2300)).toBe(deriveC('player-a', 1, 2300))
  })
})

describe('nextIndex full-period property', () => {
  it.each([1, 2, 3, 4, 5, 7, 15, 16, 97, 294, 985, 1522, 2194, 2300, 2800])(
    'visits every index exactly once before repeating, for m=%i',
    (m) => {
      const a = computeA(m)
      const c = deriveC('test-player', 1, m)

      const visited = new Set<number>()
      let x = 0
      for (let i = 0; i < m; i++) {
        x = nextIndex(a, c, m, x)
        visited.add(x)
      }

      expect(visited.size).toBe(m)
    }
  )

  it.each([
    [150, 50],
    [-10, 90],
  ])('clamps out-of-range starting offset %i the same as %i', (x, equivalentX) => {
    const m = 100
    const a = computeA(m)
    const c = deriveC('test-player', 1, m)
    expect(nextIndex(a, c, m, x)).toBe(nextIndex(a, c, m, equivalentX))
  })
})

describe('pickWeightedPack', () => {
  const packWeights = [
    { packId: 1, weight: 10 },
    { packId: 2, weight: 20 },
    { packId: 3, weight: 70 },
  ]

  it.each([
    [0, 1],
    [0.0999, 1],
    [0.1001, 2],
    [0.2999, 2],
    [0.3001, 3],
    [0.9999, 3],
  ])('a roll of %f selects pack %i', (roll, expectedPack) => {
    expect(pickWeightedPack(packWeights, () => roll)).toBe(expectedPack)
  })

  it('roughly matches expected proportions over many trials', () => {
    const counts = new Map<number, number>()
    const trials = 20000
    for (let i = 0; i < trials; i++) {
      const pack = pickWeightedPack(packWeights)
      counts.set(pack, (counts.get(pack) ?? 0) + 1)
    }

    expect((counts.get(1) ?? 0) / trials).toBeCloseTo(0.1, 1)
    expect((counts.get(2) ?? 0) / trials).toBeCloseTo(0.2, 1)
    expect((counts.get(3) ?? 0) / trials).toBeCloseTo(0.7, 1)
  })

  it('throws for an empty options array', () => {
    expect(() => pickWeightedPack([])).toThrow()
  })
})

describe('drawNextQuestion', () => {
  const range: PackRange = { startId: 500, count: 50 }

  it('maps index to the correct question id within the pack range', () => {
    const { questionId, newOffset } = drawNextQuestion('test-player', 1, 0, range)
    expect(questionId).toBeGreaterThanOrEqual(range.startId)
    expect(questionId).toBeLessThan(range.startId + range.count)
    expect(questionId).toBe(range.startId + newOffset)
  })

  it('produces every question in the pack exactly once over a full cycle', () => {
    const seen = new Set<number>()
    let offset = 0
    for (let i = 0; i < range.count; i++) {
      const draw = drawNextQuestion('test-player', 1, offset, range)
      seen.add(draw.questionId)
      offset = draw.newOffset
    }

    expect(seen.size).toBe(range.count)
    for (let id = range.startId; id < range.startId + range.count; id++) {
      expect(seen.has(id)).toBe(true)
    }
  })
})

describe('selectNormalRoundQuestions', () => {
  const ranges: Record<number, PackRange> = {
    1: { startId: 1, count: 10 },
    2: { startId: 101, count: 5 },
  }

  it('draws the requested count of distinct questions', () => {
    const packConfigs: QuestionPackConfig[] = [
      { id: 1, offset: 0 },
      { id: 2, offset: 0 },
    ]
    const { questionIds } = selectNormalRoundQuestions(
      'test-player',
      packConfigs,
      4,
      Math.random,
      ranges
    )

    expect(questionIds).toHaveLength(4)
    expect(new Set(questionIds).size).toBe(4)
  })

  it('advances the offset correctly when the same pack is drawn multiple times in one batch', () => {
    const packConfigs: QuestionPackConfig[] = [{ id: 1, offset: 0 }]
    const { questionIds, updatedPackConfigs } = selectNormalRoundQuestions(
      'test-player',
      packConfigs,
      3,
      () => 0,
      ranges
    )

    expect(questionIds).toHaveLength(3)
    expect(new Set(questionIds).size).toBe(3) // still distinct; LCG advanced each draw
    expect(updatedPackConfigs.find((p) => p.id === 1)?.offset).not.toBe(0)
  })

  it('ignores unrecognized pack ids among otherwise-valid ones', () => {
    const packConfigs: QuestionPackConfig[] = [
      { id: 1, offset: 0 },
      { id: 999, offset: 0 },
    ]
    const { questionIds, updatedPackConfigs } = selectNormalRoundQuestions(
      'test-player',
      packConfigs,
      2,
      Math.random,
      ranges
    )

    expect(questionIds.every((id) => id >= 1 && id < 11)).toBe(true)
    expect(updatedPackConfigs.map((p) => p.id)).toEqual([1])
  })

  it('falls back to all known packs at offset 0 when none are recognized', () => {
    const packConfigs: QuestionPackConfig[] = [{ id: 999, offset: 5 }]
    const { questionIds, updatedPackConfigs } = selectNormalRoundQuestions(
      'test-player',
      packConfigs,
      2,
      Math.random,
      ranges
    )

    expect(questionIds).toHaveLength(2)
    expect(updatedPackConfigs.map((p) => p.id).sort()).toEqual([1, 2])
  })

  it('falls back to all known packs at offset 0 when given an empty list', () => {
    const { updatedPackConfigs } = selectNormalRoundQuestions(
      'test-player',
      [],
      2,
      Math.random,
      ranges
    )

    expect(updatedPackConfigs.map((p) => p.id).sort()).toEqual([1, 2])
  })

  it('respects weighted distribution across packs over many trials', () => {
    const packConfigs: QuestionPackConfig[] = [
      { id: 1, offset: 0 }, // weight 10
      { id: 2, offset: 0 }, // weight 5
    ]
    const counts = new Map<number, number>()
    const trials = 3000
    for (let i = 0; i < trials; i++) {
      const { questionIds } = selectNormalRoundQuestions(
        'test-player',
        packConfigs,
        1,
        Math.random,
        ranges
      )
      const pack = questionIds[0]! < 101 ? 1 : 2
      counts.set(pack, (counts.get(pack) ?? 0) + 1)
    }

    expect((counts.get(1) ?? 0) / trials).toBeCloseTo(10 / 15, 1)
    expect((counts.get(2) ?? 0) / trials).toBeCloseTo(5 / 15, 1)
  })
})

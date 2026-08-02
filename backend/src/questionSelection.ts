import { createHash } from 'node:crypto'
import { getDb } from './db.js'
import { PACK_RANGES, type PackRange } from './packRanges.js'
import type { QuestionDocument, GameResponse, QuestionPackConfig } from './types.js'

function gcd(a: number, b: number): number {
  while (b !== 0) {
    ;[a, b] = [b, a % b]
  }
  return a
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b)
}

export function primeFactors(n: number): number[] {
  const factors: number[] = []
  let remaining = n
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      factors.push(p)
      while (remaining % p === 0) remaining /= p
    }
  }

  if (remaining > 1) {
    factors.push(remaining)
  }

  return factors
}

// Hull-Dobell: a must be ≡ 1 (mod p) for every prime p dividing m,
// and ≡ 1 (mod 4) if m is divisible by 4. This computes the smallest
// valid a strictly greater than 1.
export function computeA(m: number): number {
  const primes = primeFactors(m)
  let step = primes.reduce((acc, p) => lcm(acc, p), 1)
  if (m % 4 === 0) {
    step = lcm(step, 4)
  }
  return 1 + step
}

// Hull-Dobell: c must be coprime with m. Derived deterministically per
// (playerId, packId) so each player gets a distinct, but reproducible, sequence.
export function deriveC(playerId: string, packId: number, m: number): number {
  if (m <= 1) {
    return 0
  }

  const hash = createHash('sha256').update(`${playerId}:${packId}`).digest()
  const value = hash.readUIntBE(0, 6)

  let c = value % m
  if (c === 0) {
    c = 1
  }

  while (gcd(c, m) !== 1) {
    c = (c % m) + 1
  }

  return c
}

// Advances the LCG by one step. Clamps x into [0, m) first as a safety net
// (e.g. if a pack's size ever changes and a stored offset is now out of range).
export function nextIndex(a: number, c: number, m: number, x: number): number {
  const clamped = ((x % m) + m) % m
  return (a * clamped + c) % m
}

interface WeightedPackOption {
  packId: number
  weight: number
}

// Picks one pack at random, weighted by pack size.
export function pickWeightedPack(
  weights: WeightedPackOption[],
  random: () => number = Math.random
): number {
  if (weights.length === 0) {
    throw new Error('pickWeightedPack requires at least one option')
  }

  const total = weights.reduce((sum, o) => sum + o.weight, 0)
  let roll = random() * total
  let last = weights[0]!

  for (const option of weights) {
    if (roll < option.weight) {
      return option.packId
    }
    roll -= option.weight
    last = option
  }

  // Floating point safety net; should be unreachable in practice.
  return last.packId
}

interface QuestionDraw {
  questionId: number
  newOffset: number
}

// Combines the above primitives: given a pack's range/offset and a player,
// determines the next question and offset in the sequence.
export function drawNextQuestion(
  playerId: string,
  packId: number,
  packOffset: number,
  range: PackRange
): QuestionDraw {
  const a = computeA(range.count)
  const c = deriveC(playerId, packId, range.count)
  const newOffset = nextIndex(a, c, range.count, packOffset)
  return { questionId: range.startId + newOffset, newOffset }
}

interface NormalRoundSelection {
  questionIds: number[]
  updatedPackConfigs: QuestionPackConfig[]
}

// Resolves which packs are enabled, then draws the specified number of question via
// weighted-random pack selection and updates the selected pack's offset after each draw.
export function selectNormalRoundQuestions(
  playerId: string,
  packConfigs: QuestionPackConfig[],
  questionCount: number,
  random: () => number = Math.random,
  ranges: Record<number, PackRange> = PACK_RANGES
): NormalRoundSelection {
  const filterValidPacks = packConfigs.filter((p) => ranges[p.id] !== undefined)
  const validPacks =
    filterValidPacks.length > 0
      ? filterValidPacks
      : Object.keys(ranges).map((id) => ({ id: Number(id), offset: 0 }))

  const questionIds: number[] = []
  const packOffsets = new Map<number, number>(validPacks.map((p) => [p.id, p.offset]))
  const packWeights: WeightedPackOption[] = validPacks.map((p) => ({
    packId: p.id,
    weight: ranges[p.id]!.count,
  }))

  for (let i = 0; i < questionCount; i++) {
    const packId = pickWeightedPack(packWeights, random)
    const packOffset = packOffsets.get(packId) ?? 0
    const range = ranges[packId]!
    const { questionId, newOffset } = drawNextQuestion(playerId, packId, packOffset, range)
    packOffsets.set(packId, newOffset)
    questionIds.push(questionId)
  }

  const updatedPackConfigs = validPacks.map((p) => ({
    ...p,
    offset: packOffsets.get(p.id) ?? p.offset,
  }))
  return { questionIds, updatedPackConfigs }
}

export async function getGameResponse(
  playerId: string,
  packConfigs: QuestionPackConfig[],
  questionCount: number,
  bonusQuestionCount: number
): Promise<GameResponse> {
  const db = getDb()
  const { questionIds, updatedPackConfigs } = selectNormalRoundQuestions(
    playerId,
    packConfigs,
    questionCount
  )

  // query collection, then re-map results back into the order the questions were actually drawn in.
  const retrievedQuestions = await db
    .collection<QuestionDocument>('questions')
    .find({ _id: { $in: questionIds } })
    .toArray()
  const questionsById = new Map(retrievedQuestions.map((q) => [q._id, q]))
  const questions = questionIds
    .map((id) => questionsById.get(id))
    .filter((q): q is QuestionDocument => q !== undefined)

  const bonusQuestions = await db
    .collection<QuestionDocument>('questions')
    .aggregate<QuestionDocument>([
      {
        $match: {
          questionPack: { $in: updatedPackConfigs.map((p) => p.id) },
          _id: { $nin: questionIds },
          bonusEligible: true,
        },
      },
      { $sample: { size: bonusQuestionCount } },
    ])
    .toArray()

  return { questions, bonusQuestions, updatedPackConfigs }
}

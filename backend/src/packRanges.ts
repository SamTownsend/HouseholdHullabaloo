export interface PackRange {
  startId: number
  count: number
}

export const PACK_RANGES: Record<number, PackRange> = {
  1: { startId: 1, count: 2300 },
  2: { startId: 2301, count: 2194 },
  3: { startId: 4495, count: 2800 },
  4: { startId: 7295, count: 1522 },
  5: { startId: 8817, count: 294 },
  6: { startId: 9111, count: 985 },
}

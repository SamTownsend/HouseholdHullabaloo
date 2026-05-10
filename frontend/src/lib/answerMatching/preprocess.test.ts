import { describe, it, expect } from 'vitest'
import { normalize, parseNumber, tokenize } from './preprocess'

/*
// for debugging
describe('test', () => {
  it('test', () => {
    const input = '6 7'
    console.log(input, tokenize(input))
  })
})
*/

describe('normalize', () => {
  it('uppercases the input', () => {
    expect(normalize('hello')).toBe('HELLO')
  })

  it('replaces & with a space', () => {
    expect(normalize('salt&pepper')).toBe('SALT PEPPER')
  })

  it('replaces - with a space', () => {
    expect(normalize('forty-two')).toBe('FORTY TWO')
  })

  it('replaces / with a space', () => {
    expect(normalize('and/or')).toBe('AND OR')
  })

  it.each(['.', ':', '"', '\\'])('removes a (%s) not between two digits', (punctuation) => {
    expect(normalize(`Mr${punctuation} Smith`)).toBe('MR SMITH')
  })

  it.each(['.', ':', '"', '\\'])('preserves a (%s) between two digits', (punctuation) => {
    expect(normalize(`3${punctuation}14`)).toBe(`3${punctuation}14`)
  })

  it('collapses multiple spaces into one', () => {
    expect(normalize('too  many   spaces')).toBe('TOO MANY SPACES')
  })

  it('trims leading and trailing whitespace', () => {
    expect(normalize('  hello  ')).toBe('HELLO')
  })
})

describe('parseNumber', () => {
  it.each([
    ['ZERO', 0],
    ['ONE', 1],
    ['TWO', 2],
    ['THREE', 3],
    ['FOUR', 4],
    ['FIVE', 5],
    ['SIX', 6],
    ['SEVEN', 7],
    ['EIGHT', 8],
    ['NINE', 9],
    ['TEN', 10],
    ['ELEVEN', 11],
    ['TWELVE', 12],
    ['THIRTEEN', 13],
    ['FOURTEEN', 14],
    ['FIFTEEN', 15],
    ['SIXTEEN', 16],
    ['SEVENTEEN', 17],
    ['EIGHTEEN', 18],
    ['NINETEEN', 19],
  ])('returns the correct value for a cardinal (%s > %i)', (input, expected) => {
    expect(parseNumber(input)).toBe(expected)
  })

  it.each([
    ['ZEROTH', 0],
    ['FIRST', 1],
    ['SECOND', 2],
    ['THIRD', 3],
    ['FOURTH', 4],
    ['FIFTH', 5],
    ['SIXTH', 6],
    ['SEVENTH', 7],
    ['EIGHTH', 8],
    ['NINTH', 9],
    ['TENTH', 10],
    ['ELEVENTH', 11],
    ['TWELFTH', 12],
    ['THIRTEENTH', 13],
    ['FOURTEENTH', 14],
    ['FIFTEENTH', 15],
    ['SIXTEENTH', 16],
    ['SEVENTEENTH', 17],
    ['EIGHTEENTH', 18],
    ['NINETEENTH', 19],
    ['0TH', 0],
    ['1ST', 1],
    ['2ND', 2],
    ['3RD', 3],
    ['4TH', 4],
    ['5TH', 5],
    ['6TH', 6],
    ['7TH', 7],
    ['8TH', 8],
    ['9TH', 9],
    ['10TH', 10],
    ['11TH', 11],
    ['12TH', 12],
    ['13TH', 13],
    ['14TH', 14],
    ['15TH', 15],
    ['16TH', 16],
    ['17TH', 17],
    ['18TH', 18],
    ['19TH', 19],
  ])('returns the correct value for an ordinal (%s > %i)', (input, expected) => {
    expect(parseNumber(input)).toBe(expected)
  })

  it.each([
    ['TWENTY', 20],
    ['THIRTY', 30],
    ['FORTY', 40],
    ['FIFTY', 50],
    ['SIXTY', 60],
    ['SEVENTY', 70],
    ['EIGHTY', 80],
    ['NINETY', 90],
  ])('returns the correct value for a tens cardinal (%s > %i)', (input, expected) => {
    expect(parseNumber(input)).toBe(expected)
  })

  it.each([
    ['TWENTIETH', 20],
    ['THIRTIETH', 30],
    ['FORTIETH', 40],
    ['FIFTIETH', 50],
    ['SIXTIETH', 60],
    ['SEVENTIETH', 70],
    ['EIGHTIETH', 80],
    ['NINETIETH', 90],
    ['20TH', 20],
    ['30TH', 30],
    ['40TH', 40],
    ['50TH', 50],
    ['60TH', 60],
    ['70TH', 70],
    ['80TH', 80],
    ['90TH', 90],
  ])('returns the correct value for a tens ordinal (%s > %i)', (input, expected) => {
    expect(parseNumber(input)).toBe(expected)
  })

  it('returns 100 for HUNDRED', () => {
    expect(parseNumber('HUNDRED')).toBe(100)
  })

  it('returns 1000 for THOUSAND', () => {
    expect(parseNumber('THOUSAND')).toBe(1000)
  })

  it('is case-insensitive', () => {
    expect(parseNumber('three')).toBe(3)
  })

  it('returns null for an unrecognised word', () => {
    expect(parseNumber('BANANA')).toBeNull()
  })
})

describe('tokenize', () => {
  it('splits on spaces', () => {
    expect(tokenize('HELLO WORLD')).toEqual(['HELLO', 'WORLD'])
  })

  it.each([
    'A',
    'ABOUT',
    'AN',
    'AND',
    'AS',
    'AT',
    'BY',
    'FOR',
    'FROM',
    'IN',
    'OF',
    'ON',
    'SOME',
    'THE',
    'TO',
    'A ABOUT AN AND AS AT BY FOR FROM IN OF ON SOME THE TO',
  ])('drops stopwords (%s)', (stopword) => {
    expect(tokenize(`CAT ${stopword} DOG`)).toEqual(['CAT', 'DOG'])
  })

  it.each([
    ['IN THE SECOND HALF', ['2', 'HALF']],
    ['THIRTEEN REASONS WHY', ['13', 'REASONS', 'WHY']],
    ['A HUNDRED', ['100']],
    ['THOUSAND ISLAND DRESSING', ['1000', 'ISLAND', 'DRESSING']],
  ])('converts a spelled-out number to digits (%s > %s)', (input, expected) => {
    expect(tokenize(input)).toEqual(expected)
  })

  it.each([
    ['TWENTY ONE PILOTS', ['21', 'PILOTS']],
    ['THE FIFTY FIRST STATE', ['51', 'STATE']],
    ['ONE HUNDRED AND ONE DALMATIANS', ['101', 'DALMATIANS']],
    ['THREE HUNDRED THOUSAND AND SEVEN', ['300007']],
    ['TWENTY THOUSAND LEAGUES UNDER THE SEA', ['20000', 'LEAGUES', 'UNDER', 'SEA']],
  ])('combines multi-word numbers (%s > %s)', (input, expected) => {
    expect(tokenize(input)).toEqual(expected)
  })

  it('returns at most 20 tokens', () => {
    const input = Array(25).fill('WORD').join(' ')
    expect(tokenize(input).length).toBeLessThanOrEqual(20)
  })

  it('returns an empty array for an empty string', () => {
    expect(tokenize('')).toEqual([])
  })
})

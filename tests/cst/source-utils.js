import { getLinePos } from '../../src/cst/source-utils'
import { parse } from '../../src/cst/parse'

test('lineStarts for empty document', () => {
  const src = ''
  const cst = parse(src)
  expect(() => getLinePos(0, cst)).not.toThrow()
  expect(cst[0].lineStarts).toMatchObject([0])
})

test('lineStarts for multiple documents', () => {
  const src = 'foo\n...\nbar\n'
  const cst = parse(src)
  expect(() => getLinePos(0, cst)).not.toThrow()
  expect(cst[0].lineStarts).toMatchObject([0, 4, 8, 12])
})

test('lineStarts for malformed document', () => {
  const src = '- foo\n\t- bar\n'
  const cst = parse(src)
  expect(() => getLinePos(0, cst)).not.toThrow()
  expect(cst[0].lineStarts).toMatchObject([0, 6, 13])
})

test('getLinePos()', () => {
  const src = '- foo\n- bar\n'
  const cst = parse(src)
  expect(cst[0].lineStarts).toBeUndefined()
  expect(getLinePos(0, cst)).toMatchObject({ line: 1, col: 1 })
  expect(getLinePos(1, cst)).toMatchObject({ line: 1, col: 2 })
  expect(getLinePos(2, cst)).toMatchObject({ line: 1, col: 3 })
  expect(getLinePos(5, cst)).toMatchObject({ line: 1, col: 6 })
  expect(getLinePos(6, cst)).toMatchObject({ line: 2, col: 1 })
  expect(getLinePos(7, cst)).toMatchObject({ line: 2, col: 2 })
  expect(getLinePos(11, cst)).toMatchObject({ line: 2, col: 6 })
  expect(getLinePos(12, cst)).toMatchObject({ line: 3, col: 1 })
  expect(cst[0].lineStarts).toMatchObject([0, 6, 12])
})

test('invalid args for getLinePos()', () => {
  const src = '- foo\n- bar\n'
  const cst = parse(src)
  expect(getLinePos()).toBeNull()
  expect(getLinePos(0)).toBeNull()
  expect(getLinePos(1)).toBeNull()
  expect(getLinePos(-1, cst)).toBeNull()
  expect(getLinePos(13, cst)).toBeNull()
  expect(getLinePos(Math.MAXINT, cst)).toBeNull()
})

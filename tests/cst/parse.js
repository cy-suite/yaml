import * as YAML from '../../index.js'
const parse = YAML.parseCST

test('return value', () => {
  const src = '---\n- foo\n- bar\n'
  const cst = parse(src)
  expect(cst).toHaveLength(1)
  expect(cst[0]).toMatchObject({
    contents: [
      {
        error: null,
        items: [
          {
            error: null,
            node: {
              error: null,
              props: [],
              range: { end: 9, start: 6 },
              type: 'PLAIN',
              value: null,
              valueRange: { end: 9, start: 6 }
            },
            props: [],
            range: { end: 9, start: 4 },
            type: 'SEQ_ITEM',
            value: null,
            valueRange: { end: 9, start: 4 }
          },
          {
            error: null,
            node: {
              error: null,
              props: [],
              range: { end: 15, start: 12 },
              type: 'PLAIN',
              value: null,
              valueRange: { end: 15, start: 12 }
            },
            props: [],
            range: { end: 15, start: 10 },
            type: 'SEQ_ITEM',
            value: null,
            valueRange: { end: 15, start: 10 }
          }
        ],
        props: [],
        range: { end: 16, start: 4 },
        type: 'SEQ',
        value: null,
        valueRange: { end: 15, start: 4 }
      }
    ],
    directives: [],
    directivesEndMarker: { start: 0, end: 3 },
    documentEndMarker: null,
    error: null,
    props: [],
    range: null,
    type: 'DOCUMENT',
    value: null,
    valueRange: { start: 3, end: 16 }
  })
})

describe('toString()', () => {
  test('plain document', () => {
    const src = '- foo\n- bar\n'
    const cst = parse(src)
    expect(String(cst)).toBe(src)
  })

  test('stream of two documents', () => {
    const src = 'foo\n...\nbar\n'
    const cst = parse(src)
    expect(cst).toHaveLength(2)
    expect(String(cst)).toBe(src)
  })

  test('document with CRLF line separators', () => {
    const src = '- foo\r\n- bar\r\n'
    const cst = parse(src)
    expect(cst.toString()).toBe('- foo\n- bar\n')
  })
})

describe('setOrigRanges()', () => {
  test('return false for no CRLF', () => {
    const src = '- foo\n- bar\n'
    const cst = parse(src)
    expect(cst.setOrigRanges()).toBe(false)
    expect(cst[0].valueRange).toMatchObject({ start: 0, end: 12 })
    expect(cst[0].valueRange.origStart).toBeUndefined()
    expect(cst[0].valueRange.origEnd).toBeUndefined()
  })

  test('no error on comments', () => {
    const src = '\r\n# hello'
    expect(() => parse(src).setOrigRanges()).not.toThrowError()
  })

  test('directives', () => {
    const src = '\r\n%YAML 1.2\r\n---\r\nfoo\r\n'
    const cst = parse(src)
    expect(cst.setOrigRanges()).toBe(true)
    expect(cst[0]).toMatchObject({
      directives: [
        { type: 'BLANK_LINE' },
        {
          name: 'YAML',
          range: { end: 10, origEnd: 11, origStart: 2, start: 1 }
        }
      ],
      contents: [
        {
          type: 'PLAIN',
          range: { end: 18, origEnd: 21, origStart: 18, start: 15 }
        }
      ]
    })
  })

  test('block scalar', () => {
    const src = '|\r\n  foo\r\n  bar\r\n'
    const cst = parse(src)
    expect(cst.setOrigRanges()).toBe(true)
    const node = cst[0].contents[0]
    expect(node).toMatchObject({
      type: 'BLOCK_LITERAL',
      range: { end: 14, origEnd: 17, origStart: 0, start: 0 }
    })
    expect(node.strValue).toBe('foo\nbar\n')
  })

  test('single document', () => {
    const src = '- foo\r\n- bar\r\n'
    const cst = parse(src)
    expect(cst.setOrigRanges()).toBe(true)
    expect(cst).toHaveLength(1)
    const { range, valueRange } = cst[0].contents[0].items[1].node
    expect(src.slice(range.origStart, range.origEnd)).toBe('bar')
    expect(src.slice(valueRange.origStart, valueRange.origEnd)).toBe('bar')
    expect(cst[0]).toMatchObject({
      contents: [
        {
          error: null,
          items: [
            {
              error: null,
              node: {
                error: null,
                props: [],
                range: { end: 5, origEnd: 5, origStart: 2, start: 2 },
                type: 'PLAIN',
                value: null,
                valueRange: { end: 5, origEnd: 5, origStart: 2, start: 2 }
              },
              props: [],
              range: { end: 5, origEnd: 5, origStart: 0, start: 0 },
              type: 'SEQ_ITEM',
              value: null,
              valueRange: { end: 5, origEnd: 5, origStart: 0, start: 0 }
            },
            {
              error: null,
              node: {
                error: null,
                props: [],
                range: { end: 11, origEnd: 12, origStart: 9, start: 8 },
                type: 'PLAIN',
                value: null,
                valueRange: { end: 11, origEnd: 12, origStart: 9, start: 8 }
              },
              props: [],
              range: { end: 11, origEnd: 12, origStart: 7, start: 6 },
              type: 'SEQ_ITEM',
              value: null,
              valueRange: { end: 11, origEnd: 12, origStart: 7, start: 6 }
            }
          ],
          props: [],
          range: { end: 12, origEnd: 14, origStart: 0, start: 0 },
          type: 'SEQ',
          value: null,
          valueRange: { end: 11, origEnd: 12, origStart: 0, start: 0 }
        }
      ],
      directives: [],
      directivesEndMarker: null,
      documentEndMarker: null,
      error: null,
      props: [],
      range: null,
      type: 'DOCUMENT',
      value: null,
      valueRange: { end: 12, origEnd: 14, origStart: 0, start: 0 }
    })
    expect(cst[0].context.root).toBe(cst[0])
    expect(cst[0].contents[0].items[1].node.context.root).toBe(cst[0])
  })

  test('stream of two documents', () => {
    const src = 'foo\r\n...\r\nbar\r\n'
    const cst = parse(src)
    expect(cst.setOrigRanges()).toBe(true)
    expect(cst).toHaveLength(2)
    const { range, valueRange } = cst[1].contents[0]
    expect(src.slice(range.origStart, range.origEnd)).toBe('bar')
    expect(src.slice(valueRange.origStart, valueRange.origEnd)).toBe('bar')
    expect(cst[0]).toMatchObject({
      contents: [
        {
          error: null,
          props: [],
          range: { end: 3, origEnd: 3, origStart: 0, start: 0 },
          type: 'PLAIN',
          value: null,
          valueRange: { end: 3, origEnd: 3, origStart: 0, start: 0 }
        }
      ],
      directives: [],
      directivesEndMarker: null,
      documentEndMarker: { start: 4, end: 7, origStart: 5, origEnd: 8 },
      error: null,
      props: [],
      range: null,
      type: 'DOCUMENT',
      value: null,
      valueRange: { end: 4, origEnd: 5, origStart: 0, start: 0 }
    })
    expect(cst[1]).toMatchObject({
      contents: [
        {
          error: null,
          props: [],
          range: { end: 11, origEnd: 13, origStart: 10, start: 8 },
          type: 'PLAIN',
          value: null,
          valueRange: { end: 11, origEnd: 13, origStart: 10, start: 8 }
        }
      ],
      directives: [],
      directivesEndMarker: null,
      documentEndMarker: null,
      error: null,
      props: [],
      range: null,
      type: 'DOCUMENT',
      value: null,
      valueRange: { end: 12, origEnd: 15, origStart: 10, start: 8 }
    })
    expect(cst[0].context.root).toBe(cst[0])
    expect(cst[1].context.root).toBe(cst[1])
  })

  test('flow collections', () => {
    const src = '\r\n{ : }\r\n'
    const cst = parse(src)
    expect(() => cst.setOrigRanges()).not.toThrowError()
    expect(cst[0]).toMatchObject({
      contents: [
        {
          error: null,
          props: [],
          range: { end: 1, origEnd: 2, origStart: 1, start: 0 },
          type: 'BLANK_LINE',
          value: null,
          valueRange: null
        },
        {
          error: null,
          items: [
            { char: '{', offset: 1, origOffset: 2 },
            { char: ':', offset: 3, origOffset: 4 },
            { char: '}', offset: 5, origOffset: 6 }
          ],
          props: [],
          range: { end: 6, origEnd: 7, origStart: 2, start: 1 },
          type: 'FLOW_MAP',
          value: null,
          valueRange: { end: 6, origEnd: 7, origStart: 2, start: 1 }
        }
      ],
      directives: [],
      directivesEndMarker: null,
      documentEndMarker: null,
      error: null,
      props: [],
      range: null,
      type: 'DOCUMENT',
      value: null,
      valueRange: { end: 7, origEnd: 9, origStart: 2, start: 1 }
    })
    expect(cst[0].context.root).toBe(cst[0])
    expect(cst[0].contents[1].context.root).toBe(cst[0])
  })
})

test('blank lines', () => {
  const src = '#cc\n\n\n\n##dd'
  const cst = parse(src)
  expect(cst[0].contents).toMatchObject([
    { type: 'COMMENT', error: null },
    { type: 'BLANK_LINE', error: null },
    { type: 'BLANK_LINE', error: null },
    { type: 'BLANK_LINE', error: null },
    { type: 'COMMENT', error: null }
  ])
})

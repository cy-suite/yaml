import { MAP, SCALAR, SEQ } from '../nodes/Node.js'
import type { Pair } from '../nodes/Pair.js'
import type { SchemaOptions } from '../options.js'
import { map } from './common/map.js'
import { seq } from './common/seq.js'
import { string } from './common/string.js'
import { coreKnownTags, getTags } from './tags.js'
import type { CollectionTag, ScalarTag } from './types.js'

export type SchemaName = 'core' | 'failsafe' | 'json' | 'yaml-1.1'

const sortMapEntriesByKey = (a: Pair<any>, b: Pair<any>) =>
  a.key < b.key ? -1 : a.key > b.key ? 1 : 0

export class Schema {
  knownTags: Record<string, CollectionTag | ScalarTag>
  merge: boolean
  name: SchemaName
  sortMapEntries: ((a: Pair, b: Pair) => number) | null
  tags: Array<CollectionTag | ScalarTag>;

  // Used by createNode() and composeScalar()
  [MAP]: CollectionTag;
  [SCALAR]: ScalarTag;
  [SEQ]: CollectionTag

  constructor({
    customTags,
    merge,
    resolveKnownTags,
    schema,
    sortMapEntries
  }: SchemaOptions) {
    this.merge = !!merge
    this.name = schema || 'core'
    this.knownTags = resolveKnownTags ? coreKnownTags : {}
    this.tags = getTags(customTags, this.name)

    Object.defineProperty(this, MAP, { value: map })
    Object.defineProperty(this, SCALAR, { value: string })
    Object.defineProperty(this, SEQ, { value: seq })

    // Used by createMap()
    this.sortMapEntries =
      sortMapEntries === true ? sortMapEntriesByKey : sortMapEntries || null
  }
}

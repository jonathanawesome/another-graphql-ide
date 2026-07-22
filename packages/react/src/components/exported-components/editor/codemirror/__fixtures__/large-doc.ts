/**
 * Generates a large multi-operation GraphQL document for stress-testing the
 * editor's document-size-sensitive paths (chiefly activeOperationField, which
 * re-parses the whole document on doc and selection changes).
 *
 * Each operation is a small, parseable query against performanceTestSchema
 * (whose Query type exposes testType0..testType1399, each with the BaseEntity
 * fields), so the document is valid enough that lint work is realistic rather
 * than dominated by parse errors. This is generated query text, not a schema
 * fixture.
 */
export const makeLargeDocument = (opCount: number): string =>
  Array.from({ length: opCount }, (_, i) => {
    const typeIndex = i % 1400
    return `query Op${i} {
  testType${typeIndex} {
    id
    createdAt
    updatedAt
  }
}`
  }).join('\n\n')

import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql'

import { dateTimeScalar, emailScalar, jsonScalar } from './scalar-stubs'

// Base interface for all entities
const BaseEntity: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'BaseEntity',
  description: 'Base interface for all entities',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Unique identifier',
    },
    createdAt: {
      type: new GraphQLNonNull(dateTimeScalar),
      description: 'Creation timestamp',
    },
    updatedAt: {
      type: new GraphQLNonNull(dateTimeScalar),
      description: 'Last update timestamp',
    },
  }),
})

// Generate 1000 enums with 10 values each = 10,000 enum values
const generateEnums = () => {
  const enums: GraphQLEnumType[] = []

  for (let i = 0; i < 1000; i++) {
    const enumValues: Record<string, { description: string }> = {}
    for (let j = 0; j < 10; j++) {
      enumValues[`VALUE_${i}_${j}`] = {
        description: `Enum value ${j} for enum ${i}`,
      }
    }

    enums.push(
      new GraphQLEnumType({
        name: `TestEnum${i}`,
        description: `Test enum number ${i}`,
        values: enumValues,
      })
    )
  }

  return enums
}

// Generate 2000 input types with 5 fields each = 10,000 input fields
const generateInputTypes = (enums: GraphQLEnumType[]) => {
  const inputTypes: GraphQLInputObjectType[] = []

  for (let i = 0; i < 2000; i++) {
    const fields: Record<string, any> = {}

    for (let j = 0; j < 5; j++) {
      const fieldName = `field${j}`
      const enumIndex = (i * 5 + j) % enums.length

      switch (j) {
        case 0:
          fields[fieldName] = { type: GraphQLString }
          break
        case 1:
          fields[fieldName] = { type: GraphQLInt }
          break
        case 2:
          fields[fieldName] = { type: GraphQLBoolean }
          break
        case 3:
          fields[fieldName] = { type: enums[enumIndex] }
          break
        case 4:
          fields[fieldName] = { type: new GraphQLList(GraphQLString) }
          break
      }
    }

    inputTypes.push(
      new GraphQLInputObjectType({
        name: `TestInput${i}`,
        description: `Test input type number ${i}`,
        fields: () => fields,
      })
    )
  }

  return inputTypes
}

// Generate 1400 object types with varying field counts = ~7000 object types
const generateObjectTypes = (
  enums: GraphQLEnumType[],
  inputTypes: GraphQLInputObjectType[]
) => {
  const objectTypes: GraphQLObjectType[] = []

  for (let i = 0; i < 1400; i++) {
    const fieldCount = 5 + (i % 3) // 5, 6, or 7 fields per type
    const fields: Record<string, any> = {}

    // Add base fields
    fields.id = { type: new GraphQLNonNull(GraphQLID) }
    fields.createdAt = { type: new GraphQLNonNull(dateTimeScalar) }
    fields.updatedAt = { type: new GraphQLNonNull(dateTimeScalar) }

    for (let j = 3; j < fieldCount; j++) {
      const fieldName = `field${j}`
      const enumIndex = (i * fieldCount + j) % enums.length
      const inputIndex = (i * fieldCount + j) % inputTypes.length

      switch (j % 8) {
        case 0:
          fields[fieldName] = {
            type: GraphQLString,
            description: `String field ${j} for type ${i}`,
          }
          break
        case 1:
          fields[fieldName] = {
            type: GraphQLInt,
            description: `Integer field ${j} for type ${i}`,
          }
          break
        case 2:
          fields[fieldName] = {
            type: GraphQLFloat,
            description: `Float field ${j} for type ${i}`,
          }
          break
        case 3:
          fields[fieldName] = {
            type: GraphQLBoolean,
            description: `Boolean field ${j} for type ${i}`,
          }
          break
        case 4:
          fields[fieldName] = {
            type: enums[enumIndex],
            description: `Enum field ${j} for type ${i}`,
          }
          break
        case 5:
          fields[fieldName] = {
            type: new GraphQLList(GraphQLString),
            description: `List field ${j} for type ${i}`,
          }
          break
        case 6:
          fields[fieldName] = {
            type: emailScalar,
            description: `Email field ${j} for type ${i}`,
          }
          break
        case 7:
          fields[fieldName] = {
            type: jsonScalar,
            description: `JSON field ${j} for type ${i}`,
            args: {
              input: { type: inputTypes[inputIndex] },
            },
          }
          break
      }
    }

    objectTypes.push(
      new GraphQLObjectType({
        name: `TestType${i}`,
        description: `Test object type number ${i}`,
        interfaces: [BaseEntity],
        fields: () => fields,
      })
    )
  }

  return objectTypes
}

// Generate 200 interface types with 5 fields each = 1000 interface fields
const generateInterfaceTypes = (enums: GraphQLEnumType[]) => {
  const interfaceTypes: GraphQLInterfaceType[] = []

  for (let i = 0; i < 200; i++) {
    const fields: Record<string, any> = {}

    for (let j = 0; j < 5; j++) {
      const fieldName = `interfaceField${j}`
      const enumIndex = (i * 5 + j) % enums.length

      switch (j) {
        case 0:
          fields[fieldName] = { type: new GraphQLNonNull(GraphQLID) }
          break
        case 1:
          fields[fieldName] = { type: GraphQLString }
          break
        case 2:
          fields[fieldName] = { type: GraphQLInt }
          break
        case 3:
          fields[fieldName] = { type: enums[enumIndex] }
          break
        case 4:
          fields[fieldName] = { type: new GraphQLList(GraphQLString) }
          break
      }
    }

    interfaceTypes.push(
      new GraphQLInterfaceType({
        name: `TestInterface${i}`,
        description: `Test interface number ${i}`,
        fields: () => fields,
      })
    )
  }

  return interfaceTypes
}

// Generate 100 union types with 5 types each = 500 union member references
const generateUnionTypes = (objectTypes: GraphQLObjectType[]) => {
  const unionTypes: GraphQLUnionType[] = []

  for (let i = 0; i < 100; i++) {
    const memberTypes: GraphQLObjectType[] = []
    for (let j = 0; j < 5; j++) {
      const typeIndex = (i * 5 + j) % objectTypes.length
      memberTypes.push(objectTypes[typeIndex])
    }

    unionTypes.push(
      new GraphQLUnionType({
        name: `TestUnion${i}`,
        description: `Test union type number ${i}`,
        types: memberTypes,
        resolveType: () => memberTypes[0].name,
      })
    )
  }

  return unionTypes
}

// Generate all types
const enums = generateEnums()
const inputTypes = generateInputTypes(enums)
const objectTypes = generateObjectTypes(enums, inputTypes)
const interfaceTypes = generateInterfaceTypes(enums)
const unionTypes = generateUnionTypes(objectTypes)

// Create comprehensive root query with access to all types
const QueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root query type for performance testing with 10,000+ types',
  fields: () => {
    const fields: Record<string, any> = {}

    // Add a field for each object type
    objectTypes.forEach((type, index) => {
      fields[`testType${index}`] = {
        type,
        description: `Get test type ${index}`,
        resolve: () => ({
          id: `${index}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      }
    })

    // Add fields for union types
    unionTypes.forEach((type, index) => {
      fields[`testUnion${index}`] = {
        type,
        description: `Get test union ${index}`,
        resolve: () => ({
          id: `union-${index}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      }
    })

    // Add a general search field that can return any type
    fields.search = {
      type: new GraphQLList(unionTypes[0]),
      args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
        limit: { type: GraphQLInt, defaultValue: 10 },
      },
      description: 'Search across all test types',
      resolve: () => [],
    }

    // Add a field that uses all enum types as arguments
    fields.testEnums = {
      type: GraphQLString,
      args: enums.reduce(
        (acc, enumType, index) => {
          acc[`enum${index}`] = { type: enumType }
          return acc
        },
        {} as Record<string, any>
      ),
      description: 'Test field that accepts all enum types as arguments',
      resolve: () => 'enum test result',
    }

    // Add a metadata field
    fields.schemaInfo = {
      type: new GraphQLObjectType({
        name: 'SchemaInfo',
        fields: {
          totalEnumTypes: { type: GraphQLInt },
          totalObjectTypes: { type: GraphQLInt },
          totalInputTypes: { type: GraphQLInt },
          totalInterfaceTypes: { type: GraphQLInt },
          totalUnionTypes: { type: GraphQLInt },
          totalTypes: { type: GraphQLInt },
        },
      }),
      description: 'Information about this test schema',
      resolve: () => ({
        totalEnumTypes: enums.length,
        totalObjectTypes: objectTypes.length,
        totalInputTypes: inputTypes.length,
        totalInterfaceTypes: interfaceTypes.length,
        totalUnionTypes: unionTypes.length,
        totalTypes:
          enums.length +
          objectTypes.length +
          inputTypes.length +
          interfaceTypes.length +
          unionTypes.length,
      }),
    }

    return fields
  },
})

// Create comprehensive mutation type
const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root mutation type for performance testing',
  fields: () => {
    const fields: Record<string, any> = {}

    // Add create mutations for first 100 object types
    objectTypes.slice(0, 100).forEach((type, index) => {
      const inputIndex = index % inputTypes.length
      fields[`create${type.name}`] = {
        type,
        args: {
          input: { type: new GraphQLNonNull(inputTypes[inputIndex]) },
        },
        description: `Create a new ${type.name}`,
        resolve: () => ({
          id: `created-${index}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      }
    })

    return fields
  },
})

// Create the performance test schema
export const performanceTestSchema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  description: `Performance test schema with ${enums.length + objectTypes.length + inputTypes.length + interfaceTypes.length + unionTypes.length} types for GraphQL tooling performance testing`,
  types: [
    ...enums,
    ...inputTypes,
    ...objectTypes,
    ...interfaceTypes,
    ...unionTypes,
    BaseEntity,
  ],
})

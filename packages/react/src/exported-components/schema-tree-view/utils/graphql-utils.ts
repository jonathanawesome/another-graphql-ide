import {
  GraphQLType,
  isNonNullType,
  isListType,
  isScalarType,
  isObjectType,
  isEnumType,
  isInterfaceType,
  isUnionType,
  getNamedType,
} from 'graphql'

import type { IconNames } from '../../../ui-components/icon/icon'

/**
 * Get the display name for a GraphQL type, including list and non-null wrappers
 */
export function getTypeDisplayName(type: GraphQLType): string {
  if (isNonNullType(type)) {
    return `${getTypeDisplayName(type.ofType)}!`
  }
  if (isListType(type)) {
    return `[${getTypeDisplayName(type.ofType)}]`
  }
  const namedType = getNamedType(type)
  return namedType.name
}

/**
 * Get the appropriate icon name for a GraphQL type
 */
export function getTypeIcon(type: GraphQLType): IconNames {
  const namedType = getNamedType(type)

  if (isScalarType(namedType)) return 'CircleFill'
  if (isObjectType(namedType)) return 'Code'
  if (isEnumType(namedType)) return 'ChevronsUpDown'
  if (isInterfaceType(namedType)) return 'Combine'
  if (isUnionType(namedType)) return 'BowArrow'

  return 'CircleFill'
}

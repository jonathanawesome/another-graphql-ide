import {
  GraphQLType,
  isScalarType,
  isObjectType,
  isEnumType,
  isInterfaceType,
  isUnionType,
  getNamedType,
} from 'graphql'

import type { IconNames } from '../../../ui-components/icon/icon'

/**
 * Get the appropriate icon name for a GraphQL type
 */
export function getTypeIcon(type: GraphQLType): IconNames {
  const namedType = getNamedType(type)

  if (isScalarType(namedType)) return 'SeparatorRound'
  if (isObjectType(namedType)) return 'Code'
  if (isEnumType(namedType)) return 'List'
  if (isInterfaceType(namedType)) return 'Merge'
  if (isUnionType(namedType)) return 'Merge'

  return 'CircleFill'
}

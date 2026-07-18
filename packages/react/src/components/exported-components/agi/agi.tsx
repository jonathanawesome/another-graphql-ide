import type { GraphQLSchema } from 'graphql'

type Connection = {
  endpoint: string
  headers: HeadersInit[]
  name?: string
}

type AGIProps = {
  /**
   * Accepts an array of connections, selectable via dropdown, or an executable GraphQLSchema
   */
  connections: Connection[] | GraphQLSchema
}

export const AGI = ({ connections }: AGIProps) => {
  // eslint-disable-next-line no-console
  console.log('AGI', { connections })
  return (
    <div>
      <div>app nav</div>
      <div>
        ide + operation selector
        <div>operation selector</div>
        <div>ide</div>
      </div>
    </div>
  )
}

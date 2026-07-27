import {
  parseVariables,
  runRequest,
  type CreateTransportOptions,
  type ExecutionResult,
  type ExecutionStatus,
  type Transport,
} from '@another-graphql-ide/state'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useAGIStore } from './agi-store-context'

export type UseOperationOptions = {
  query: string
  /** An object, or raw text to parse as JSON5. */
  variables?: Record<string, unknown> | string
  operationName?: string
  /** Override the provider's connection for this operation only. */
  endpoint?: string
  headers?: Record<string, string>
  transport?: Transport
}

export type UseOperationResult = {
  run: (overrides?: Partial<UseOperationOptions>) => Promise<void>
  cancel: () => void
  /** The latest chunk, copied so its identity changes per update. */
  result?: ExecutionResult
  /** The same chunk pretty-printed. */
  response: string
  status: ExecutionStatus
  error?: string
}

type OperationState = {
  status: ExecutionStatus
  response: string
  result?: ExecutionResult
  error?: string
}

const IDLE: OperationState = { status: 'idle', response: '' }

/**
 * Runs a caller-supplied operation against the provider's connection, keeping
 * every result in local state. Nothing here touches the shared document or
 * response, so a run button can sit beside an editor without disturbing it.
 */
export const useOperation = (
  options: UseOperationOptions
): UseOperationResult => {
  const store = useAGIStore()
  const [state, setState] = useState<OperationState>(IDLE)
  const controllerRef = useRef<AbortController | null>(null)
  const latest = useRef(options)

  // Written in an effect rather than during render: a render React throws away
  // would otherwise leave its options behind for the next run.
  useEffect(() => {
    latest.current = options
  }, [options])

  useEffect(() => () => controllerRef.current?.abort(), [])

  const cancel = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    // runRequest reports an abort without an outcome callback, so the status
    // has to be reset here or the UI stays stuck showing a running operation.
    setState(previous => ({ ...previous, status: 'idle' }))
  }, [])

  const run = useCallback(
    async (overrides?: Partial<UseOperationOptions>) => {
      const request = { ...latest.current, ...overrides }

      // Abort first, so a double click cannot leave two streams writing here.
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      setState({ status: 'fetching', response: '' })

      const parsed =
        typeof request.variables === 'string'
          ? parseVariables(request.variables)
          : ({ ok: true, value: request.variables } as const)

      if (!parsed.ok) {
        setState({ status: 'error', response: '', error: parsed.message })
        return
      }

      // Built by hand because getTransport spreads its overrides, so an
      // undefined endpoint here would clobber the store's.
      const connection: Partial<CreateTransportOptions> = {}
      if (request.endpoint !== undefined) connection.endpoint = request.endpoint
      if (request.headers !== undefined) connection.headers = request.headers

      const transport =
        request.transport ?? store.getState().getTransport(connection)

      const outcome = await runRequest(
        transport,
        {
          query: request.query,
          variables: parsed.value,
          operationName: request.operationName,
        },
        controller.signal,
        {
          // Copied because a transport may yield one accumulator it mutates,
          // which React would treat as an unchanged value.
          onResult: result =>
            setState({
              status: 'streaming',
              result: { ...result },
              response: JSON.stringify(result, null, 2),
            }),
          onError: error =>
            setState(previous => ({ ...previous, status: 'error', error })),
        }
      )

      if (outcome === 'completed') {
        setState(previous => ({ ...previous, status: 'idle' }))
      }
    },
    [store]
  )

  return { ...state, run, cancel }
}

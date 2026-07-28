import type { ExecutionResult } from '@another-graphql-ide/state'
import { useEffect, useState } from 'react'

import { Popover } from '../../components/primitives/popover/popover'
import { RunControl } from '../../components/primitives/run-control/run-control'
import { useOperation } from '../../state'

import { runButtonStyles } from './run-button.css'

export type RunButtonProps = {
  /** The operation to run. Never touches the shared document. */
  operation: string
  variables?: Record<string, unknown>
  operationName?: string
  /** Override the provider's connection for this button only. */
  endpoint?: string
  headers?: Record<string, string>
  /** Button text when idle. */
  text?: string
  onResult?: (result: ExecutionResult) => void
}

/**
 * Runs a given operation and shows the result in a popover, leaving whatever
 * else is on the page alone. Drop it beside prose, in a table, anywhere.
 */
export const RunButton = ({
  operation,
  variables,
  operationName,
  endpoint,
  headers,
  text = 'Run',
  onResult,
}: RunButtonProps) => {
  const [open, setOpen] = useState(false)
  const { run, cancel, result, response, status, error } = useOperation({
    query: operation,
    variables,
    operationName,
    endpoint,
    headers,
  })

  useEffect(() => {
    if (result) onResult?.(result)
  }, [result, onResult])

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        error ? (
          <p className={runButtonStyles.error} role="alert">
            {error}
          </p>
        ) : (
          <pre className={runButtonStyles.result}>{response || 'Running…'}</pre>
        )
      }
      trigger={
        <RunControl
          status={status}
          text={text}
          onRun={() => {
            setOpen(true)
            void run()
          }}
          onCancel={cancel}
        />
      }
    />
  )
}

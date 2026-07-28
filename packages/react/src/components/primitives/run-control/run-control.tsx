import type { ExecutionStatus } from '@another-graphql-ide/state'

import { Button } from '../button/button'

import { runControlStyles } from './run-control.css'

export type RunControlProps = React.HTMLAttributes<HTMLDivElement> & {
  status: ExecutionStatus
  onRun: () => void
  onCancel?: () => void
  /** Button text when idle. */
  text?: string
  error?: string
  /** Forwarded to the container so an overlay can anchor to this control. */
  ref?: React.Ref<HTMLDivElement>
}

/**
 * Run and stop for one operation, driven entirely by props so the same control
 * serves the document pane, the docs recipe and a standalone run button.
 */
export const RunControl = ({
  status,
  onRun,
  onCancel,
  text = 'Run',
  error,
  ref,
  ...props
}: RunControlProps) => {
  const running = status === 'fetching' || status === 'streaming'

  return (
    <div {...props} ref={ref} className={runControlStyles.container}>
      {/* In the DOM rather than only in a tooltip, so the message is reachable
          without hovering. */}
      {status === 'error' && error && (
        <span className={runControlStyles.error} role="alert" title={error}>
          {error}
        </span>
      )}

      {running ? (
        <Button
          action={onCancel}
          label="Stop operation"
          text="Stop"
          withLeftIcon="X"
        />
      ) : (
        <Button
          action={onRun}
          label="Execute operation"
          text={text}
          withLeftIcon="Play"
        />
      )}
    </div>
  )
}

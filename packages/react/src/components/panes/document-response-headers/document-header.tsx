import { Button } from '../../ui-components/button/button'
import { IconButtonGroup } from '../../ui-components/icon-button-group/icon-button-group'
import { Separator } from '../../ui-components/separator/separator'

import { sharedStyles } from './shared.css'

export type DocumentHeaderProps = {
  operationName?: string
  onExecute?: () => void
  onCopy?: () => void
  onPrettify?: () => void
}

export const DocumentHeader = ({
  operationName,
  onExecute,
  onCopy,
  onPrettify,
}: DocumentHeaderProps) => {
  return (
    <div className={sharedStyles.container}>
      <div className={sharedStyles.left}>
        <div className={sharedStyles.title}>Document</div>
      </div>
      <div className={sharedStyles.right}>
        <IconButtonGroup
          icons={[
            {
              action: onCopy,
              label: 'Copy document',
              name: 'Copy',
              size: 'mini',
              tooltipOptions: { side: 'bottom' },
            },
            {
              action: onPrettify,
              label: 'Prettify document',
              name: 'Prettier',
              size: 'mini',
              tooltipOptions: { side: 'bottom' },
            },
            {
              label: 'Split',
              name: 'Tabs',
              size: 'mini',
              state: 'disabled',
            },
            {
              label: 'Favorite highlighted operation',
              name: 'Star',
              size: 'mini',
            },
          ]}
        />
        <div className={sharedStyles.separatorContainer}>
          <Separator orientation="vertical" />
        </div>
        <IconButtonGroup
          icons={[
            {
              label: 'Enable Apollo-compatible batch mode',
              name: 'Combine',
              size: 'mini',
              tooltipOptions: { side: 'bottom' },
            },
          ]}
        />
        <div className={sharedStyles.separatorContainer}>
          <Separator orientation="vertical" />
        </div>
        <Button
          action={onExecute}
          label="Execute operation"
          text={operationName ?? 'Run'}
          withLeftIcon="Play"
        />
      </div>
    </div>
  )
}

import { IconButtonGroup } from '../../ui-components/icon-button-group/icon-button-group'

import { sharedStyles } from './shared.css'

export type ResponseHeaderProps = {
  onCopy?: () => void
}

export const ResponseHeader = ({ onCopy }: ResponseHeaderProps) => {
  return (
    <div className={sharedStyles.container}>
      <div className={sharedStyles.left}>
        <div className={sharedStyles.title}>Response</div>
      </div>
      <div className={sharedStyles.right}>
        <IconButtonGroup
          icons={[
            {
              action: onCopy,
              label: 'Copy response',
              name: 'Copy',
              size: 'mini',
              tooltipOptions: { side: 'bottom' },
            },
          ]}
        />
      </div>
    </div>
  )
}

import { IconButtonGroup } from '../../ui-components/icon-button-group/icon-button-group'

import { sharedStyles } from './shared.css'

export const ResponseHeader = () => {
  return (
    <div className={sharedStyles.container}>
      <div className={sharedStyles.left}>
        <div className={sharedStyles.title}>Response</div>
      </div>
      <div className={sharedStyles.right}>
        <IconButtonGroup
          icons={[
            {
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

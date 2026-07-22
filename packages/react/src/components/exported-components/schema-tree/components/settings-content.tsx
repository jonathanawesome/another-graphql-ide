import type { ObjectFieldInsertionMode } from '@another-graphql-ide/state'
import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'

import { useAppStore } from '../../../../state'

import { settingsContentStyles } from './settings-content.css'

const OPTIONS: { value: ObjectFieldInsertionMode; label: string }[] = [
  { value: 'typename', label: 'Insert __typename' },
  { value: 'bare', label: 'No subselection' },
]

/**
 * Schema tree settings popover content. Controls how a newly inserted object
 * field gets its required subselection, bound directly to shared state so the
 * toggle action reads the live value.
 */
export const SettingsContent = () => {
  const mode = useAppStore.use.objectFieldInsertionMode()
  const setMode = useAppStore.use.setObjectFieldInsertionMode()

  return (
    <div className={settingsContentStyles.container}>
      <div className={settingsContentStyles.title}>Object field insertion</div>
      <RadioGroup
        className={settingsContentStyles.group}
        value={mode}
        onValueChange={value => setMode(value)}
      >
        {OPTIONS.map(option => (
          <label key={option.value} className={settingsContentStyles.option}>
            <Radio.Root
              className={settingsContentStyles.radio}
              value={option.value}
            >
              <Radio.Indicator className={settingsContentStyles.indicator} />
            </Radio.Root>
            {option.label}
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}

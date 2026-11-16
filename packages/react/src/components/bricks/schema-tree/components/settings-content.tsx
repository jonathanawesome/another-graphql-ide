import type { ObjectFieldInsertionMode } from '@another-graphql-ide/state'
import { Checkbox } from '@base-ui/react/checkbox'
import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { useId } from 'react'

import { useAppStore } from '../../../../state'
import { Kbd } from '../../../primitives/kbd/kbd'
import { Separator } from '../../../primitives/separator/separator'

import { settingsContentStyles } from './settings-content.css'

const OPTIONS: { value: ObjectFieldInsertionMode; label: string }[] = [
  { value: 'typename', label: 'Insert __typename' },
  { value: 'bare', label: 'No subselection' },
]

/**
 * Schema tree settings popover content, bound directly to shared state so the
 * toggle action reads the live value.
 *
 * A setting that also has a shortcut shows it here. The panel is where someone
 * goes to look for a behavior, so it is the natural place to learn the faster
 * way to reach it, and reading the keys from the registry means the note cannot
 * drift from the binding that fires.
 */
export type SettingsContentProps = {
  /** False for a browse-only tree, where insertion settings do not apply. */
  showInsertion?: boolean
}

export const SettingsContent = ({
  showInsertion = true,
}: SettingsContentProps) => {
  const mode = useAppStore.use.objectFieldInsertionMode()
  const setMode = useAppStore.use.setObjectFieldInsertionMode()
  const showFieldTypes = useAppStore.use.showFieldTypes()
  const setShowFieldTypes = useAppStore.use.setShowFieldTypes()
  // Associates the label with the control explicitly, so the pairing survives
  // the extra markup the shortcut chip needs and two panels never share an id.
  const showTypesId = useId()

  return (
    <div className={settingsContentStyles.container}>
      {showInsertion && (
        <>
          {/* The shortcut flips the pair rather than picking one option, so it
              sits with the heading instead of on either radio. */}
          <div className={settingsContentStyles.titleRow}>
            <span className={settingsContentStyles.title}>
              Object field insertion
            </span>
            <Kbd shortcut="schema-tree.toggle-insertion-mode" />
          </div>
          <RadioGroup
            className={settingsContentStyles.group}
            value={mode}
            onValueChange={value => setMode(value)}
          >
            {OPTIONS.map(option => (
              <label
                key={option.value}
                className={settingsContentStyles.option}
              >
                <Radio.Root
                  className={settingsContentStyles.radio}
                  value={option.value}
                >
                  <Radio.Indicator
                    className={settingsContentStyles.indicator}
                  />
                </Radio.Root>
                {option.label}
              </label>
            ))}
          </RadioGroup>

          <Separator orientation="horizontal" />
        </>
      )}

      <div className={settingsContentStyles.title}>Display</div>
      <div className={settingsContentStyles.group}>
        <label
          className={settingsContentStyles.shortcutOption}
          htmlFor={showTypesId}
        >
          <Checkbox.Root
            id={showTypesId}
            className={settingsContentStyles.checkbox}
            checked={showFieldTypes}
            onCheckedChange={setShowFieldTypes}
          >
            <Checkbox.Indicator
              className={settingsContentStyles.checkIndicator}
            />
          </Checkbox.Root>
          <span className={settingsContentStyles.optionText}>
            Show return types
          </span>
          <Kbd shortcut="schema-tree.toggle-field-types" />
        </label>
      </div>
    </div>
  )
}

import { RecipeVariants } from '@another-graphql-ide/style'

import { Icon, type IconNames } from '../../ui-components/icon/icon'
import { IconButton } from '../../ui-components/icon-button/icon-button'

import { inputStyles } from './input.css'

export type InputProps = {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  isDisabled?: boolean
  leftIcon?: IconNames
  name: string
  placeholder: string
  withClearValue?: Pick<
    NonNullable<RecipeVariants<typeof inputStyles.container>>,
    'withClearValue'
  >['withClearValue']
  value: string
}

export const Input = ({
  handleChange,
  isDisabled,
  leftIcon,
  name,
  placeholder,
  withClearValue = false,
  value,
}: InputProps) => {
  return (
    <div
      className={inputStyles.container({
        withClearValue,
        withLeftIcon: !!leftIcon,
      })}
    >
      {leftIcon && (
        <div
          className={inputStyles.iconContainer({ location: 'left' })}
          // attr for targeting in css
          data-location="left"
        >
          <Icon name={leftIcon} size="small" />
        </div>
      )}

      <input
        className={inputStyles.input}
        autoComplete="off"
        disabled={isDisabled}
        id={name}
        name={name}
        onChange={e => handleChange(e)}
        placeholder={placeholder}
        type="text"
        value={value}
      />

      {withClearValue && value && (
        <div className={inputStyles.iconContainer({ location: 'right' })}>
          <IconButton
            ghost={true}
            name="X"
            label="Clear search"
            action={() =>
              handleChange({
                target: { value: '' },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            size="mini"
          />
        </div>
      )}
    </div>
  )
}

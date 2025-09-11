import { Icon } from '../../ui-components/icon/icon'
import { IconButton } from '../../ui-components/icon-button/icon-button'
import { Input, InputProps } from '../../ui-components/input/input'

import { searchStyles } from './search.css'

export type SearchProps = InputProps & {}

export const Search = ({
  handleChange,
  name,
  placeholder,
  value,
}: SearchProps) => {
  return (
    <div className={searchStyles.container}>
      <div
        className={searchStyles.iconContainer({ location: 'left' })}
        data-location="left"
      >
        <Icon name="Search" size="small" />
      </div>

      <div className={searchStyles.input}>
        <Input
          placeholder={placeholder}
          handleChange={handleChange}
          name={name}
          value={value}
        />
      </div>

      {value && (
        <div className={searchStyles.iconContainer({ location: 'right' })}>
          <IconButton
            ghost={true}
            name="X"
            title="Clear search"
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

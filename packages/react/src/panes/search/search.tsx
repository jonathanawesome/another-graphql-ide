import { Icon } from '../../ui-components/icon/icon'
import { IconButton } from '../../ui-components/icon-button/icon-button'

import { searchStyles } from './search.css'

export type SearchProps = {
  onChange: (value: string) => void
  placeholder: string
  value: string
}

export const Search = ({ onChange, placeholder, value }: SearchProps) => {
  return (
    <div className={searchStyles.container}>
      <div
        className={searchStyles.iconContainer({ location: 'left' })}
        data-location="left"
      >
        <Icon name="Search" size="small" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={searchStyles.input}
      />
      {value && (
        <div className={searchStyles.iconContainer({ location: 'right' })}>
          <IconButton
            ghost={true}
            name="X"
            title="Clear search"
            action={() => onChange('')}
            size="mini"
          />
        </div>
      )}
    </div>
  )
}

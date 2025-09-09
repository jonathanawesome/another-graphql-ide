import { RecipeVariants } from '@vanilla-extract/recipes'

import { Icon } from '../../../../packages/react/src/ui-components/icon/icon'

import { floatingToggleClass } from './floating-toggle.css'

type FloatingToggleProps = {
  onClick: () => void
  theme?: 'light' | 'dark'
  title: string
  type: Pick<
    NonNullable<RecipeVariants<typeof floatingToggleClass>>,
    'type'
  >['type']
}

export function FloatingToggle({
  onClick,
  theme,
  title,
  type,
}: FloatingToggleProps) {
  return (
    <button
      className={floatingToggleClass({ type })}
      onClick={onClick}
      title={title}
    >
      {type === 'shelf' ? (
        <Icon name="Settings2" />
      ) : (
        <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} />
      )}
    </button>
  )
}

import { RecipeVariants } from '@another-graphql-ide/style'

import { AppNavigationItem } from '../../ui-components/app-navigation-item/app-navigation-item'
import { IconButton } from '../../ui-components/icon-button/icon-button'
import { Separator } from '../../ui-components/separator/separator'

import { appNavigationStyles } from './app-navigation.css'

export type AppNavigationProps = {
  orientation: Pick<
    NonNullable<RecipeVariants<typeof appNavigationStyles.container>>,
    'orientation'
  >['orientation']
}

export const AppNavigation = ({ orientation }: AppNavigationProps) => {
  return (
    <div className={appNavigationStyles.container({ orientation })}>
      <IconButton
        ghost={true}
        name="GraphQL"
        size="large"
        state="highlight"
        label="GraphQL"
      />
      <Separator
        orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
      />
      <div className={appNavigationStyles.list({ orientation })}>
        <AppNavigationItem
          active={true}
          icon={{
            ghost: true,
            name: 'Compass',
            size: orientation === 'horizontal' ? 'small' : 'large',
            state: 'active',
            label: 'Compass',
          }}
          orientation={orientation}
          text="IDE"
        />
        <AppNavigationItem
          active={false}
          icon={{
            ghost: true,
            name: 'BookOpenText',
            size: orientation === 'horizontal' ? 'small' : 'large',
            label: 'BookOpenText',
          }}
          orientation={orientation}
          text="Reference"
        />
        <AppNavigationItem
          active={false}
          icon={{
            ghost: true,
            name: 'Code',
            size: orientation === 'horizontal' ? 'small' : 'large',
            label: 'Code',
          }}
          orientation={orientation}
          text="SDL"
        />
      </div>
    </div>
  )
}

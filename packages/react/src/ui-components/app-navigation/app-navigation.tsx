import { RecipeVariants } from '@another-graphql-ide/style'

import { AppNavigationItem } from '../app-navigation-item/app-navigation-item'
import { IconButton } from '../icon-button/icon-button'
import { Separator } from '../separator/separator'

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
        iconName="GraphQL"
        size="large"
        state="highlight"
        title="GraphQL"
      />
      <Separator
        orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
      />
      <div className={appNavigationStyles.list({ orientation })}>
        <AppNavigationItem
          active={true}
          icon={{
            state: 'active',
            iconName: 'Compass',
            size: orientation === 'horizontal' ? 'small' : 'large',
            title: 'Compass',
          }}
          orientation={orientation}
          text="IDE"
        />
        <AppNavigationItem
          active={false}
          icon={{
            iconName: 'BookOpenText',
            size: orientation === 'horizontal' ? 'small' : 'large',
            title: 'BookOpenText',
          }}
          orientation={orientation}
          text="Reference"
        />
        <AppNavigationItem
          active={false}
          icon={{
            iconName: 'Code',
            size: orientation === 'horizontal' ? 'small' : 'large',
            title: 'Code',
          }}
          orientation={orientation}
          text="SDL"
        />
      </div>
    </div>
  )
}

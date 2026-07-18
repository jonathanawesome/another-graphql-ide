import { RecipeVariants } from '@another-graphql-ide/style'

import { previewsStyles } from './previews.css'

export const DemoGrid = ({
  children,
  gap = 12,
}: React.PropsWithChildren<{
  gap?: Pick<
    NonNullable<RecipeVariants<typeof previewsStyles.demoGrid>>,
    'gap'
  >['gap']
}>) => {
  return <div className={previewsStyles.demoGrid({ gap })}>{children}</div>
}

export const DemoGridItem = ({ children }: React.PropsWithChildren) => {
  return <div className={previewsStyles.demoGridItem}>{children}</div>
}

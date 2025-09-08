import { previewsStyles } from './previews.css'

export const DemoGrid = ({ children }: React.PropsWithChildren) => {
  return <div className={previewsStyles.demoGrid}>{children}</div>
}

export const DemoGridItem = ({ children }: React.PropsWithChildren) => {
  return <div className={previewsStyles.demoGridItem}>{children}</div>
}

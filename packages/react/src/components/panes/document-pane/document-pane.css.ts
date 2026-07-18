import { style } from '@another-graphql-ide/style'

export const documentPaneStyles = {
  container: style(
    { display: 'flex', flexDirection: 'column', height: '100%' },
    'document-pane'
  ),
  editor: style({ flex: 1, minHeight: 0 }, 'document-pane-editor'),
}

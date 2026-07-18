import { style } from '@another-graphql-ide/style'

export const responsePaneStyles = {
  container: style(
    { display: 'flex', flexDirection: 'column', height: '100%' },
    'response-pane'
  ),
  editor: style({ flex: 1, minHeight: 0 }, 'response-pane-editor'),
}

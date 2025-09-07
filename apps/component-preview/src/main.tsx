import { ThemeProvider } from '@another-graphql-ide/style'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { App } from './app'
import '@another-graphql-ide/style/global.css'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)

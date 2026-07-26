import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@zeturn/watercolor-react'
import './index.css'
import App from './App'
import { I18nProvider } from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultMode="light">
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)

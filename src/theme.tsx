import * as React from 'react'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'

type Mode = 'light' | 'dark'

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} })

const getInitialMode = (): Mode => {
  const saved = localStorage.getItem('mui-mode')
  if (saved === 'light' || saved === 'dark') return saved
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode>(getInitialMode)

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode(prev => {
          const next = prev === 'light' ? 'dark' : 'light'
          localStorage.setItem('mui-mode', next)
          return next
        })
      }
    }),
    []
  )

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: mode === 'light' ? '#1976d2' : '#90caf9' },
          background: {
            default: mode === 'light' ? '#f6f8fb' : '#0b0e14',
            paper: mode === 'light' ? '#ffffff' : '#0f131a'
          }
        },
        shape: { borderRadius: 12 },
        components: {
          MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
          MuiButton: { defaultProps: { disableElevation: true } }
        }
      }),
    [mode]
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
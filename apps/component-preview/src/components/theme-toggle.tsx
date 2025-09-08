import { useTheme } from '@another-graphql-ide/style'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const handleToggle = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  const handleSystemToggle = () => {
    setTheme('system')
  }

  return (
    <div>
      <button onClick={handleToggle}>
        {resolvedTheme === 'dark' ? '☀️' : '🌙'} {resolvedTheme}
      </button>
      <button onClick={handleSystemToggle}>🖥️ system</button>
    </div>
  )
}

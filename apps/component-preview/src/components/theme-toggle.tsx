import { useTheme } from '@another-graphql-ide/style';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleToggle = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const handleSystemToggle = () => {
    setTheme('system');
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px' }}>
      <button onClick={handleToggle}>
        {resolvedTheme === 'dark' ? '☀️' : '🌙'} {resolvedTheme}
      </button>
      <button 
        onClick={handleSystemToggle}
        style={{ 
          opacity: theme === 'system' ? 1 : 0.6,
          fontWeight: theme === 'system' ? 'bold' : 'normal'
        }}
      >
        🖥️ system
      </button>
    </div>
  );
}
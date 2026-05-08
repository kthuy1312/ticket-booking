import { useThemeStore } from '@/stores/useThemeStore';
import { Sun, Moon } from 'lucide-react';
import { useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="btn-ghost !p-2 !rounded-full w-10 h-10 flex items-center justify-center relative overflow-hidden group"
      title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
    >
      <div className="relative w-5 h-5">
        <Sun className={`w-5 h-5 text-amber-400 absolute transition-all duration-500 transform ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
        <Moon className={`w-5 h-5 text-violet-400 absolute transition-all duration-500 transform ${theme === 'light' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
      </div>
    </button>
  );
}

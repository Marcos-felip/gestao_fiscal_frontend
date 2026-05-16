import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tema claro (padrão)
        'primary': 'hsl(211 100% 50%)',
        'primary-foreground': '#ffffff',
        'secondary': 'hsl(184 100% 50%)',
        'secondary-foreground': '#ffffff',
        'destructive': 'hsl(0 84% 60%)',
        'destructive-foreground': '#ffffff',
        'ghost': 'transparent',
        'ghost-foreground': 'hsl(0 0% 20%)',
        'foreground': 'hsl(0 0% 20%)',
        'background': 'hsl(0 0% 100%)',
        'card': 'hsl(0 0% 100%)',
        'card-line': 'hsl(0 0% 90%)',
        'muted-foreground': 'hsl(0 0% 50%)',
        'muted-foreground-1': 'hsl(0 0% 60%)',
        'border': 'hsl(0 0% 90%)',
      },
      fontFamily: {
        'sans': ['Inter', ...defaultTheme.fontFamily.sans],
      },
      // Animation timing & easing (custom for Design System)
      animation: {
        // UI feedback animations
        'entrance-fade': 'entrance-fade 0.3s ease-out forwards',
        'entrance-slide-up': 'entrance-slide-up 0.3s ease-out forwards',
        'entrance-scale': 'entrance-scale 0.3s ease-out forwards',
        'exit-fade': 'exit-fade 0.2s ease-in forwards',
        'exit-slide-down': 'exit-slide-down 0.2s ease-in forwards',
        'shake': 'shake 0.4s ease-in-out',
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
      },
      // Keyframes for animations
      keyframes: {
        'entrance-fade': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'entrance-slide-up': {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'entrance-scale': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        'exit-fade': {
          'from': { opacity: '1' },
          'to': { opacity: '0' },
        },
        'exit-slide-down': {
          'from': { opacity: '1', transform: 'translateY(0)' },
          'to': { opacity: '0', transform: 'translateY(16px)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      // Custom spacing if needed (extend Tailwind defaults)
      spacing: {
        'xs': '0.25rem', // 4px
        'sm': '0.5rem',  // 8px
        'md': '1rem',    // 16px
        'lg': '1.5rem',  // 24px
        'xl': '2rem',    // 32px
      },
    },
  },
  plugins: [],
  // Suporte a dark mode com data-theme attribute (Preline)
  darkMode: ['selector', '[data-theme="dark"]'],
} satisfies Config

import type { Config } from 'tailwindcss'

export default {
  // Inherit all Preline defaults - no need to redefine colors/tokens
  content: ['./index.html', './src/**/*.{vue,ts,jsx,tsx}'],
  theme: {
    extend: {
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
} satisfies Config

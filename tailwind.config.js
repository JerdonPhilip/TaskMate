/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'pixel': ['"Press Start 2P"', 'cursive'],
                'pixel-secondary': ['"VT323"', 'monospace'],
                'sans': ['system-ui', 'sans-serif'], // Add fallback
            },
            fontSize: {
                'xs-pixel': ['0.65rem', { lineHeight: '1rem' }],
                'sm-pixel': ['0.75rem', { lineHeight: '1.25rem' }],
                'base-pixel': ['0.875rem', { lineHeight: '1.5rem' }],
            },
            colors: {
                'rpg': {
                    'dark': '#1a1a2e',
                    'darker': '#16213e',
                    'panel': '#1e1e3a',
                    'border': '#2a2a4a',
                    'gold': '#ffd700',
                    'gold-dark': '#b8960f',
                    'xp': '#00ff88',
                    'health': '#ff4444',
                    'mana': '#4488ff',
                    'stamina': '#ffaa00',
                }
            },
            animation: {
                'quest-complete': 'questComplete 0.5s ease-out',
                'level-up': 'levelUp 1s ease-out',
                'shake': 'shake 0.5s ease-in-out',
                'pulse-glow': 'pulseGlow 2s infinite',
                'float': 'float 3s ease-in-out infinite',
                'fadeIn': 'fadeIn 0.3s ease-out',
                'slideIn': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                questComplete: {
                    '0%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.2)', opacity: '0.8' },
                    '100%': { transform: 'scale(0)', opacity: '0' },
                },
                levelUp: {
                    '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
                    '50%': { transform: 'scale(1.1)', filter: 'brightness(1.5)' },
                    '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)' },
                    '50%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            backgroundImage: {
                'parchment': 'linear-gradient(135deg, #2d1b0e 0%, #4a3520 100%)',
                'rpg-dark': 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)',
                'card-gradient': 'linear-gradient(135deg, #1e1e3a 0%, #2a2a4a 100%)',
            },
        },
    },
    plugins: [],
}
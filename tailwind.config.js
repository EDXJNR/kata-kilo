/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  /** Match ThemeContext (`data-theme`), not OS prefers-color-scheme */
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        basalt: 'rgb(var(--color-basalt) / <alpha-value>)',
        basalt2: 'rgb(var(--color-basalt2) / <alpha-value>)',
        bone: 'rgb(var(--color-bone) / <alpha-value>)',
        fog: 'rgb(var(--color-fog) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        cyan: 'rgb(var(--color-cyan) / <alpha-value>)',
        amber: 'rgb(var(--color-amber) / <alpha-value>)',
        pink: 'rgb(var(--color-pink) / <alpha-value>)',
        violet: 'rgb(var(--color-violet) / <alpha-value>)',
        alert: 'rgb(var(--color-alert) / <alpha-value>)',
        hud: {
          surface: 'rgb(var(--hud-surface) / <alpha-value>)',
          'container-low': 'rgb(var(--hud-container-low) / <alpha-value>)',
          'container-lowest': 'rgb(var(--hud-container-lowest) / <alpha-value>)',
          'container-high': 'rgb(var(--hud-container-high) / <alpha-value>)',
          'container-highest': 'rgb(var(--hud-container-highest) / <alpha-value>)',
          on: 'rgb(var(--hud-on-surface) / <alpha-value>)',
          'on-variant': 'rgb(var(--hud-on-variant) / <alpha-value>)',
          primary: 'rgb(var(--hud-primary) / <alpha-value>)',
          'primary-container': 'rgb(var(--hud-primary-container) / <alpha-value>)',
          'on-primary': 'rgb(var(--hud-on-primary) / <alpha-value>)',
          secondary: 'rgb(var(--hud-secondary) / <alpha-value>)',
          'secondary-container': 'rgb(var(--hud-secondary-container) / <alpha-value>)',
          'on-secondary-container': 'rgb(var(--hud-on-secondary-container) / <alpha-value>)',
          'outline-variant': 'rgb(var(--hud-outline-variant) / <alpha-value>)'
        },
        /* legacy aliases */
        moss: 'rgb(var(--color-primary) / <alpha-value>)',
        ember: 'rgb(var(--color-accent) / <alpha-value>)',
        slate: 'rgb(var(--color-cyan) / <alpha-value>)'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        'body-hud': ['Inter', '"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}

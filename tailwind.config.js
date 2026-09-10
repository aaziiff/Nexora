/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0F1512',
          900: '#141B17',
          800: '#1A221E',
          700: '#232D28',
          600: '#313D37',
          500: '#4A5750',
          400: '#6B7A72',
          300: '#94A39B',
          200: '#C2CCC6',
          100: '#E4E8E6',
        },
        sage: {
          900: '#2A362C',
          800: '#3D4D40',
          700: '#526656',
          600: '#687E6D',
          500: '#7C8D7B',
          400: '#95A594',
          300: '#B0BEB0',
          200: '#CCD8CC',
          100: '#E6ECE6',
          50: '#F4F7F4',
        },
        ivory: {
          900: '#3D3830',
          800: '#6B6358',
          700: '#9E9486',
          600: '#C4BCB0',
          500: '#DDD7CE',
          400: '#ECE6DD',
          300: '#F4EFE9',
          200: '#F8F5F0',
          100: '#FAF8F5',
          50: '#FDFCFB',
        },
        sand: {
          DEFAULT: '#E8E2D8',
          light: '#F2ECE2',
          dark: '#D5CDBF',
        },
        stone: {
          light: '#EFECE6',
          DEFAULT: '#D8D4CC',
          dark: '#7A756D',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Syne"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      letterSpacing: {
        'ultra-wide': '0.25em',
        'super-wide': '0.35em',
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
        'marquee-slow': 'marquee 50s linear infinite',
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}

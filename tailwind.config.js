/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
  ],
  safelist: [
    'bg-orange-500',
    'bg-gray-500',
    'bg-red-600',
    'bg-purple-500',
    'text-orange-500',
    'text-gray-500',
    'text-red-600',
    'text-purple-500',
    'border-orange-500',
    'border-gray-500',
    'border-red-600',
    'border-purple-500',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

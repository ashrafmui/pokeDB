import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	"./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
  // Border colors
  'border-red-500', 'border-red-600', 'border-red-700',
  'border-blue-500', 'border-blue-600', 'border-blue-700',
  'border-yellow-400', 'border-yellow-500', 'border-yellow-600',
  'border-gray-300', 'border-gray-400', 'border-gray-500', 'border-gray-800', 'border-gray-900',
  'border-cyan-300', 'border-cyan-400', 'border-cyan-500',
  'border-emerald-500',
  'border-orange-400', 'border-orange-500',
  'border-green-500',
  'border-pink-300', 'border-pink-400',
  'border-slate-400',
  'border-purple-600', 'border-purple-700',
  'border-amber-600',
  'border-indigo-600',
  'border-violet-600',
  // Text colors
  'text-red-500', 'text-red-600', 'text-red-700',
  'text-blue-500', 'text-blue-600', 'text-blue-700',
  'text-yellow-500', 'text-yellow-600',
  'text-gray-400', 'text-gray-500', 'text-gray-800', 'text-gray-900',
  'text-cyan-400', 'text-cyan-500',
  'text-emerald-500',
  'text-orange-400', 'text-orange-500',
  'text-green-500',
  'text-pink-400',
  'text-slate-400',
  'text-purple-600', 'text-purple-700',
  'text-amber-600',
  'text-indigo-600',
  'text-violet-600',
  // Hover backgrounds
  'hover:bg-red-50', 'hover:bg-blue-50', 'hover:bg-yellow-50',
  'hover:bg-gray-50', 'hover:bg-cyan-50', 'hover:bg-emerald-50',
  'hover:bg-orange-50', 'hover:bg-green-50', 'hover:bg-pink-50',
  'hover:bg-slate-50', 'hover:bg-purple-50', 'hover:bg-amber-50',
  'hover:bg-indigo-50', 'hover:bg-violet-50',
],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			'pocket-monk': [
  				'Pocket Monk',
  				'sans-serif'
  			],
  			'pokemon-gb': ['"Pokemon GB"', 'monospace'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

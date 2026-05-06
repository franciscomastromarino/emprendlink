import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'var(--font-montserrat), sans-serif' },
        body: { value: 'var(--font-montserrat), sans-serif' },
      },
      colors: {
        // Primary — navy blue from EmprendLink design system
        brand: {
          50: { value: '#E8F0FE' },
          100: { value: '#C5D9F8' },
          200: { value: '#8DB8F2' },
          300: { value: '#5A9AE8' },
          400: { value: '#3B7DDD' },
          500: { value: '#2E5EA6' },
          600: { value: '#1B3B6F' },
          700: { value: '#152E58' },
          800: { value: '#0F2040' },
          900: { value: '#091428' },
          950: { value: '#050A14' },
        },
        // Accent — warm amber/orange
        accent: {
          50: { value: '#FEF3E2' },
          100: { value: '#FDE4B8' },
          200: { value: '#FACF85' },
          300: { value: '#F7B952' },
          400: { value: '#F5A623' },
          500: { value: '#E8932F' },
          600: { value: '#D4820A' },
          700: { value: '#A66508' },
          800: { value: '#784906' },
          900: { value: '#4A2D04' },
          950: { value: '#251702' },
        },
        // Success — green for matches, online status
        success: {
          50: { value: '#dcfce7' },
          100: { value: '#bbf7d0' },
          200: { value: '#86efac' },
          300: { value: '#4ade80' },
          400: { value: '#22c55e' },
          500: { value: '#16a34a' },
          600: { value: '#166534' },
          700: { value: '#14532d' },
          800: { value: '#052e16' },
          900: { value: '#022c22' },
          950: { value: '#011d13' },
        },
        // Light-mode surface colors
        surface: {
          bg: { value: '#FFFFFF' },
          card: { value: '#FFFFFF' },
          elevated: { value: '#F5F5F5' },
          border: { value: '#E0E0E0' },
          input: { value: '#FFFFFF' },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          contrast: { value: 'white' },
          fg: { value: '{colors.brand.600}' },
          subtle: { value: '{colors.brand.50}' },
          muted: { value: '{colors.brand.100}' },
          emphasized: { value: '{colors.brand.400}' },
          solid: { value: '{colors.brand.500}' },
          focusRing: { value: '{colors.brand.400}' },
          border: { value: '{colors.brand.400}' },
        },
        accent: {
          contrast: { value: 'white' },
          fg: { value: '{colors.accent.600}' },
          subtle: { value: '{colors.accent.50}' },
          muted: { value: '{colors.accent.100}' },
          emphasized: { value: '{colors.accent.400}' },
          solid: { value: '{colors.accent.500}' },
          focusRing: { value: '{colors.accent.400}' },
          border: { value: '{colors.accent.400}' },
        },
        bg: {
          DEFAULT: { value: '{colors.surface.bg}' },
          muted: { value: '{colors.surface.card}' },
          subtle: { value: '{colors.surface.elevated}' },
        },
        fg: {
          DEFAULT: { value: '#333333' },
          muted: { value: '#666666' },
          subtle: { value: '#999999' },
        },
        border: {
          DEFAULT: { value: '{colors.surface.border}' },
        },
      },
    },
  },
  globalCss: {
    'html, body': {
      fontFamily: 'var(--font-montserrat), sans-serif',
      bg: '{colors.surface.bg}',
      color: '#333333',
      colorScheme: 'light',
    },
    ...({
      '@keyframes spinGlow': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
    } as object),
  },
})

export const system = createSystem(defaultConfig, config)

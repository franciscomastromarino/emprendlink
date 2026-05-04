'use client'

import { Box, Wrap, Tag } from '@chakra-ui/react'

export type ChipColorScheme = 'blue' | 'orange' | 'green'

const CHIP_STYLES: Record<ChipColorScheme, { selectedBg: string; selectedColor: string; dotColor: string }> = {
  blue: { selectedBg: '#E8F0FE', selectedColor: '#1B3B6F', dotColor: '#2E5EA6' },
  orange: { selectedBg: '#FEF3E2', selectedColor: '#A66508', dotColor: '#F5A623' },
  green: { selectedBg: '#dcfce7', selectedColor: '#166534', dotColor: '#22c55e' },
}

interface Props {
  options: readonly string[]
  value: string[]
  onChange: (next: string[]) => void
  max: number
  colorScheme?: ChipColorScheme
}

export function ChipSelect({ options, value, onChange, max, colorScheme = 'blue' }: Props) {
  const styles = CHIP_STYLES[colorScheme]

  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else if (value.length < max) {
      onChange([...value, opt])
    }
  }

  return (
    <Wrap gap="2" role="group" aria-label="Opciones de selección">
      {options.map((opt) => {
        const selected = value.includes(opt)
        return (
          <Tag.Root
            key={opt}
            size="lg"
            cursor="pointer"
            role="option"
            aria-selected={selected}
            tabIndex={0}
            onClick={() => toggle(opt)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggle(opt)
              }
            }}
            borderRadius="full"
            px="3"
            bg={selected ? styles.selectedBg : 'transparent'}
            borderWidth="1px"
            borderColor={selected ? styles.selectedBg : '#E0E0E0'}
            color={selected ? styles.selectedColor : 'fg.DEFAULT'}
            fontWeight="500"
            transition="all 0.15s"
            _focus={{ outline: '2px solid', outlineColor: 'brand.400', outlineOffset: '2px' }}
          >
            <Box w="1.5" h="1.5" borderRadius="full" bg={selected ? styles.dotColor : '#ccc'} flexShrink={0} />
            <Tag.Label fontSize="sm">{opt}</Tag.Label>
          </Tag.Root>
        )
      })}
    </Wrap>
  )
}

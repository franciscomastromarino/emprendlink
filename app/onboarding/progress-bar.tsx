'use client'

import { Box, Container, HStack, Text } from '@chakra-ui/react'

export function ProgressBar({ step }: { step: number }) {
  return (
    <Container maxW="sm" py="4">
      <HStack gap="2" mb="1">
        {[1, 2, 3].map((s) => (
          <Box
            key={s}
            flex="1"
            h="1.5"
            borderRadius="full"
            bg={s <= step ? 'brand.500' : 'surface.elevated'}
            transition="background 0.3s"
          />
        ))}
      </HStack>
      <Text fontSize="sm" color="fg.subtle" textAlign="center">
        Paso {step} de 3
      </Text>
    </Container>
  )
}

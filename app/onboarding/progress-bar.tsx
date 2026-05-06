'use client'

import { Box, Button, Container, HStack, Text } from '@chakra-ui/react'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function ProgressBar({ step }: { step: number }) {
  return (
    <Container maxW="sm" py="4">
      <HStack justify="space-between" mb="1">
        <HStack gap="2" flex="1">
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
        <Button
          variant="ghost"
          size="xs"
          color="fg.subtle"
          onClick={() => signOut({ callbackUrl: '/' })}
          ml="3"
        >
          <LogOut size={14} />
          Salir
        </Button>
      </HStack>
      <Text fontSize="sm" color="fg.subtle">
        Paso {step} de 3
      </Text>
    </Container>
  )
}

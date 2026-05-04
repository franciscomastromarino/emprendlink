'use client'

import { signIn } from 'next-auth/react'
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'

function NetworkSvg() {
  return (
    <Box w="180px" h="140px" mx="auto">
      <svg viewBox="0 0 200 160" width="180" height="140">
        <defs>
          <radialGradient id="loginGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2E5EA6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2E5EA6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="80" r="75" fill="url(#loginGlow)" />
        {/* Person left */}
        <circle cx="60" cy="60" r="14" fill="#F5F5F5" stroke="#2E5EA6" strokeWidth="1.5" />
        <circle cx="60" cy="55" r="5" fill="#3B7DDD" />
        <path d="M52 68 Q60 75 68 68" fill="none" stroke="#3B7DDD" strokeWidth="1.5" />
        {/* Person right */}
        <circle cx="140" cy="60" r="14" fill="#F5F5F5" stroke="#2E5EA6" strokeWidth="1.5" />
        <circle cx="140" cy="55" r="5" fill="#3B7DDD" />
        <path d="M132 68 Q140 75 148 68" fill="none" stroke="#3B7DDD" strokeWidth="1.5" />
        {/* Person bottom */}
        <circle cx="100" cy="115" r="14" fill="#F5F5F5" stroke="#2E5EA6" strokeWidth="1.5" />
        <circle cx="100" cy="110" r="5" fill="#3B7DDD" />
        <path d="M92 123 Q100 130 108 123" fill="none" stroke="#3B7DDD" strokeWidth="1.5" />
        {/* Connections */}
        <line x1="74" y1="60" x2="126" y2="60" stroke="#2E5EA6" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="68" y1="72" x2="92" y2="103" stroke="#2E5EA6" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 3" />
        <line x1="132" y1="72" x2="108" y2="103" stroke="#2E5EA6" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 3" />
        {/* Pulse dots */}
        <circle cx="100" cy="60" r="2.5" fill="#1B3B6F">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="80" cy="88" r="2" fill="#1B3B6F">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="120" cy="88" r="2" fill="#1B3B6F">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </Box>
  )
}

export default function LoginPage() {
  return (
    <Box position="relative" overflow="hidden" minH="100dvh" display="flex" alignItems="center">
      {/* Background glow */}
      <Box
        position="absolute"
        top="-100px"
        left="50%"
        transform="translateX(-50%)"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(46,94,166,0.06) 0%, transparent 70%)"
        pointerEvents="none"
      />

      <Container maxW="sm" py="20" position="relative">
        <Stack gap="8" align="center">
          <Stack gap="3" textAlign="center" align="center">
            <Text fontWeight="bold" fontSize="2xl" color="brand.600">
              <Text as="span" color="#F5A623">E.</Text> Emprend<Text as="span" color="#F5A623">Link</Text> <Text as="span" fontSize="xs" fontWeight="normal" opacity={0.7}>(no oficial)</Text>
            </Text>
            <NetworkSvg />
            <Text color="fg.muted">Conectá con emprendedores de tu comunidad</Text>
          </Stack>
          <Stack gap="3" w="full">
            <Button
              onClick={() => signIn('google', { callbackUrl: '/feed' })}
              size="lg"
              w="full"
              colorPalette="brand"
            >
              Continuar con Google
            </Button>
            <Button
              onClick={() => signIn('linkedin', { callbackUrl: '/feed' })}
              size="lg"
              w="full"
              variant="outline"
            >
              Continuar con LinkedIn
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

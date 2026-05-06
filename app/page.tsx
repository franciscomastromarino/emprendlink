export const dynamic = 'force-dynamic'

import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  Compass,
  UserPlus,
  Search,
  Handshake,
  Users,
} from 'lucide-react'

/* ── Network illustration for the hero ── */
function HeroIllustration() {
  return (
    <Box w="160px" h="160px" mx="auto">
      <svg viewBox="0 0 200 200" width="160" height="160">
        <defs>
          <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Outer ring glow */}
        <circle cx="100" cy="100" r="90" fill="url(#heroGlow)" />
        {/* Connection rings */}
        <circle cx="100" cy="100" r="75" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
        <circle cx="100" cy="100" r="55" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
        {/* Center logo circle */}
        <circle cx="100" cy="100" r="28" fill="rgba(255,255,255,0.15)" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
        <text x="100" y="106" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">E.</text>
        {/* User avatars around the circle */}
        <circle cx="55" cy="55" r="14" fill="rgba(255,255,255,0.2)" stroke="white" strokeOpacity="0.5" strokeWidth="1" />
        <circle cx="55" cy="52" r="5" fill="rgba(255,255,255,0.6)" />
        <path d="M48 60 Q55 66 62 60" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />

        <circle cx="145" cy="55" r="14" fill="rgba(255,255,255,0.2)" stroke="white" strokeOpacity="0.5" strokeWidth="1" />
        <circle cx="145" cy="52" r="5" fill="#F5A623" />
        <path d="M138 60 Q145 66 152 60" fill="none" stroke="#F5A623" strokeWidth="1" />

        <circle cx="55" cy="145" r="14" fill="rgba(255,255,255,0.2)" stroke="white" strokeOpacity="0.5" strokeWidth="1" />
        <circle cx="55" cy="142" r="5" fill="#F5A623" />
        <path d="M48 150 Q55 156 62 150" fill="none" stroke="#F5A623" strokeWidth="1" />

        <circle cx="145" cy="145" r="14" fill="rgba(255,255,255,0.2)" stroke="white" strokeOpacity="0.5" strokeWidth="1" />
        <circle cx="145" cy="142" r="5" fill="rgba(255,255,255,0.6)" />
        <path d="M138 150 Q145 156 152 150" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />

        {/* Connection lines from center to avatars */}
        <line x1="78" y1="78" x2="66" y2="66" stroke="white" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="122" y1="78" x2="134" y2="66" stroke="white" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="78" y1="122" x2="66" y2="134" stroke="white" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="122" y1="122" x2="134" y2="134" stroke="white" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />

        {/* Animated pulse dots on connections */}
        <circle cx="72" cy="72" r="2" fill="#F5A623">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="128" cy="72" r="2" fill="white" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="72" cy="128" r="2" fill="white" opacity="0.6">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="128" cy="128" r="2" fill="#F5A623">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </Box>
  )
}

/* ── Quick access card ── */
const QUICK_ACCESS = [
  { icon: Compass, title: 'Descubrir', subtitle: 'Perfiles para vos', href: '/discover' },
  { icon: Search, title: 'Explorar', subtitle: 'Buscá miembros', href: '/feed' },
  { icon: Handshake, title: 'Matches', subtitle: 'Conexiones mutuas', href: '/matches' },
  { icon: Users, title: 'Mi perfil', subtitle: 'Editá tus datos', href: '/settings' },
]

/* ── How it works steps ── */
const STEPS = [
  {
    number: '01',
    title: 'Creá tu perfil',
    description: 'Contanos quién sos, qué hacés y qué te interesa.',
    Icon: UserPlus,
  },
  {
    number: '02',
    title: 'Explorá miembros',
    description: 'Descubrí emprendedores según industria, ubicación o intereses.',
    Icon: Search,
  },
  {
    number: '03',
    title: 'Conectá y colaborá',
    description: 'Iniciá conversaciones, compartí ideas y generá oportunidades.',
    Icon: Handshake,
  },
]

export default async function HomePage() {
  const memberCount = await prisma.profile.count({
    where: { community: 'emprending', visible: true, onboardingComplete: true },
  })
  return (
    <Box>
      {/* ── Hero section ── */}
      <Box
        position="relative"
        bg="linear-gradient(135deg, #1B3B6F 0%, #2E5EA6 50%, #3B7DDD 100%)"
        overflow="hidden"
        pb="10"
        pt="8"
      >
        {/* Orange glow accents */}
        <Box
          position="absolute"
          top="-20%"
          right="-15%"
          w="350px"
          h="350px"
          bg="radial-gradient(circle, rgba(245,166,35,0.2) 0%, transparent 70%)"
          borderRadius="full"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-25%"
          left="-10%"
          w="250px"
          h="250px"
          bg="radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)"
          borderRadius="full"
          pointerEvents="none"
        />

        <Container maxW="lg" position="relative" px="6">
          <Stack gap="6" align="center">
            {/* Logo */}
            <HStack gap="2" alignSelf="start">
              <Text fontWeight="800" fontSize="lg" color="white">
                <Text as="span" color="#F5A623">E.</Text> EMPREND<Text as="span" color="#F5A623">LINK</Text> <Text as="span" fontSize="xs" fontWeight="normal" opacity={0.7}>(no oficial)</Text>
              </Text>
            </HStack>

            {/* Badge */}
            <Box
              bg="rgba(255,255,255,0.15)"
              borderRadius="full"
              px="4"
              py="1"
              borderWidth="1px"
              borderColor="rgba(255,255,255,0.2)"
            >
              <Text fontSize="xs" color="white" fontWeight="500">
                Comunidad exclusiva
              </Text>
            </Box>

            {/* Heading */}
            <Heading
              size={{ base: '2xl', md: '3xl' }}
              color="white"
              textAlign="center"
              lineHeight="1.2"
              maxW="sm"
            >
              Conectá con{' '}
              <Text as="span" color="#F5A623">emprendedores</Text>
              {' '}de tu comunidad
            </Heading>

            {/* Subtitle */}
            <Text
              color="whiteAlpha.800"
              textAlign="center"
              fontSize="sm"
              maxW="xs"
              lineHeight="1.5"
            >
              Hacé crecer tu red, compartí ideas y generá oportunidades reales.
            </Text>

            {/* Illustration */}
            <HeroIllustration />

            {/* CTA buttons */}
            <HStack gap="3" w="full" justify="center" px="4">
              <Button
                asChild
                size="lg"
                bg="#F5A623"
                color="white"
                _hover={{ bg: '#E8932F' }}
                borderRadius="full"
                px="6"
                fontWeight="600"
              >
                <Link href="/login">Explorar miembros</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: 'rgba(255,255,255,0.1)' }}
                borderRadius="full"
                px="6"
              >
                <a href="#como-funciona">Cómo funciona</a>
              </Button>
            </HStack>
          </Stack>
        </Container>
      </Box>

      {/* ── Quick access cards ── */}
      <Container maxW="lg" mt="-6" position="relative" zIndex="1">
        <SimpleGrid columns={{ base: 4 }} gap="3">
          {QUICK_ACCESS.map((item) => (
            <Link key={item.title} href={item.href}>
              <Stack
                align="center"
                textAlign="center"
                gap="1.5"
                p="3"
                bg="white"
                borderRadius="xl"
                boxShadow="0 2px 12px rgba(0,0,0,0.08)"
                transition="transform 0.2s"
                _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
              >
                <Box
                  w="10"
                  h="10"
                  borderRadius="lg"
                  bg="brand.50"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <item.icon size={20} color="#2E5EA6" />
                </Box>
                <Text fontSize="xs" fontWeight="600" color="fg.DEFAULT">
                  {item.title}
                </Text>
                <Text fontSize="2xs" color="fg.muted" lineHeight="1.3">
                  {item.subtitle}
                </Text>
              </Stack>
            </Link>
          ))}
        </SimpleGrid>
      </Container>

      {/* ── Cómo funciona section ── */}
      <Container maxW="lg" py="10" id="como-funciona">
        <Stack gap="8">
          <Heading size="lg" textAlign="center">
            Cómo funciona
          </Heading>

          <Stack gap="4">
            {STEPS.map((step) => (
              <HStack
                key={step.number}
                gap="4"
                p="4"
                bg="white"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="surface.border"
                boxShadow="0 1px 4px rgba(0,0,0,0.04)"
              >
                <Box
                  w="12"
                  h="12"
                  borderRadius="full"
                  bg="brand.50"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Text fontWeight="800" fontSize="sm" color="brand.600">
                    {step.number}
                  </Text>
                </Box>
                <Stack gap="0.5">
                  <Heading size="sm">{step.title}</Heading>
                  <Text fontSize="sm" color="fg.muted">
                    {step.description}
                  </Text>
                </Stack>
              </HStack>
            ))}
          </Stack>
        </Stack>
      </Container>

      {/* ── CTA — ¿Listo para conectar? ── */}
      <Container maxW="lg" pb="10" px="6">
        <Stack
          align="center"
          gap="3"
          bg="linear-gradient(135deg, #1B3B6F 0%, #2E5EA6 100%)"
          p="6"
          borderRadius="2xl"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-40%"
            right="-15%"
            w="180px"
            h="180px"
            bg="radial-gradient(circle, rgba(245,166,35,0.2) 0%, transparent 70%)"
            borderRadius="full"
            pointerEvents="none"
          />
          <Heading size="md" color="white" textAlign="center" position="relative">
            ¿Listo para conectar?
          </Heading>
          <Text fontSize="sm" color="whiteAlpha.800" textAlign="center" position="relative">
            Creá tu perfil en menos de 2 minutos
          </Text>
          <Button
            asChild
            size="lg"
            bg="#F5A623"
            color="white"
            _hover={{ bg: '#E8932F' }}
            borderRadius="full"
            px="8"
            fontWeight="600"
            position="relative"
          >
            <Link href="/login">Empezar ahora</Link>
          </Button>
        </Stack>
      </Container>

      {/* ── Community stats banner ── */}
      <Container maxW="lg" pb="10" px="6">
        <Box
          bg="linear-gradient(135deg, #1B3B6F 0%, #2E5EA6 100%)"
          borderRadius="2xl"
          p="5"
          position="relative"
          overflow="hidden"
        >
          {/* Orange accent glow */}
          <Box
            position="absolute"
            top="-50%"
            right="-20%"
            w="200px"
            h="200px"
            bg="radial-gradient(circle, rgba(245,166,35,0.2) 0%, transparent 70%)"
            borderRadius="full"
            pointerEvents="none"
          />

          <HStack gap="4" position="relative">
            {/* Stacked avatars */}
            <Box flexShrink={0}>
              <svg viewBox="0 0 80 40" width="80" height="40">
                <circle cx="16" cy="20" r="14" fill="#3B7DDD" stroke="white" strokeWidth="2" />
                <circle cx="16" cy="17" r="5" fill="white" opacity="0.7" />
                <circle cx="32" cy="20" r="14" fill="#F5A623" stroke="white" strokeWidth="2" />
                <circle cx="32" cy="17" r="5" fill="white" opacity="0.7" />
                <circle cx="48" cy="20" r="14" fill="#1B3B6F" stroke="white" strokeWidth="2" />
                <circle cx="48" cy="17" r="5" fill="white" opacity="0.7" />
                <circle cx="64" cy="20" r="14" fill="#3B7DDD" stroke="white" strokeWidth="2" />
                <text x="64" y="24" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+</text>
              </svg>
            </Box>
            <Stack gap="0.5">
              <HStack gap="1">
                <Users size={16} color="#F5A623" />
                <Text fontWeight="700" color="white" fontSize="sm">
                  {memberCount} {memberCount === 1 ? 'emprendedor activo' : 'emprendedores activos'}
                </Text>
              </HStack>
              <Text color="whiteAlpha.700" fontSize="xs">
                en la comunidad esta semana
              </Text>
            </Stack>
          </HStack>
        </Box>
      </Container>

      {/* ── Footer note ── */}
      <Container maxW="lg" pb="8" px="6">
        <Text fontSize="xs" color="fg.subtle" textAlign="center">
          Exclusivo para miembros de EmprendLink (no oficial)
        </Text>
      </Container>
    </Box>
  )
}

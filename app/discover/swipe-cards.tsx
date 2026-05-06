'use client'

import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link as ChakraLink,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { Profile } from '@prisma/client'
import { likeProfile } from './actions'
import { trackEvent } from '@/lib/analytics'
import { Zap, X, MapPin, Users, ChevronRight, CircleCheck, MoreHorizontal } from 'lucide-react'

function MatchBanner({
  name,
  onContinue,
}: {
  name: string
  onContinue: () => void
}) {
  return (
    <Stack align="center" gap="5" p="8" textAlign="center">
      <Box w="120px" h="80px">
        <svg viewBox="0 0 120 80" width="120" height="80">
          <defs>
            <radialGradient id="matchGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="40" r="38" fill="url(#matchGlow)" />
          <circle cx="42" cy="35" r="10" fill="#F5F5F5" stroke="#22c55e" strokeWidth="1.5" />
          <circle cx="42" cy="32" r="4" fill="#4ade80" />
          <circle cx="78" cy="35" r="10" fill="#F5F5F5" stroke="#22c55e" strokeWidth="1.5" />
          <circle cx="78" cy="32" r="4" fill="#4ade80" />
          <path d="M52 40 Q60 50 68 40" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 2">
            <animate attributeName="stroke-dashoffset" values="0;10" dur="1.5s" repeatCount="indefinite" />
          </path>
        </svg>
      </Box>
      <Stack gap="2">
        <Heading size="lg" color="green.400">Match!</Heading>
        <Text fontSize="lg">
          Vos y <Text as="span" fontWeight="bold">{name}</Text> se dieron like mutuamente.
        </Text>
        <Text color="fg.muted" fontSize="sm">
          Podés contactarlo/a desde tu lista de matches.
        </Text>
      </Stack>
      <Button onClick={onContinue} colorPalette="green" size="lg" w="full" borderRadius="full">
        Seguir descubriendo
      </Button>
    </Stack>
  )
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Stack gap="4" align="center" textAlign="center" py="2">
      {/* Top row: status + menu */}
      <HStack w="full" justify="space-between" px="1">
        <HStack gap="1.5">
          <Box w="2" h="2" borderRadius="full" bg="success.400" />
          <Text fontSize="xs" color="success.400" fontWeight="600">Disponible</Text>
        </HStack>
        <Box color="fg.subtle" cursor="pointer" role="button" tabIndex={0} aria-label="Más opciones">
          <MoreHorizontal size={18} />
        </Box>
      </HStack>

      {/* Avatar with ring + icon badge */}
      <Box position="relative">
        <Box
          borderRadius="full"
          p="0.5"
          borderWidth="2px"
          borderColor="surface.border"
        >
          <Avatar.Root size="2xl">
            <Avatar.Image src={profile.avatarUrl || undefined} />
            <Avatar.Fallback>{profile.fullName[0]}</Avatar.Fallback>
          </Avatar.Root>
        </Box>
        {/* Lightning badge */}
        <Box
          position="absolute"
          bottom="0"
          right="0"
          w="8"
          h="8"
          borderRadius="full"
          bg="#3B7DDD"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderWidth="3px"
          borderColor="white"
        >
          <Zap size={14} color="white" fill="white" />
        </Box>
      </Box>

      {/* Name & role */}
      <Stack gap="0.5">
        <Heading size="lg">{profile.fullName}</Heading>
        <Text color="fg.muted" fontSize="sm">
          {profile.role} en{' '}
          {profile.startupUrl ? (
            <ChakraLink href={profile.startupUrl} target="_blank" color="fg.DEFAULT" fontWeight="600">
              {profile.startup}
            </ChakraLink>
          ) : (
            <Text as="span" fontWeight="600" color="fg.DEFAULT">{profile.startup}</Text>
          )}
        </Text>
      </Stack>

      {/* Meta: team size + city */}
      <HStack gap="2" color="fg.muted" fontSize="xs" flexWrap="wrap" justify="center">
        {profile.teamSize && (
          <HStack gap="1">
            <Users size={12} />
            <Text>{profile.teamSize} {profile.teamSize === 'Solo founder' ? '' : 'personas'}</Text>
          </HStack>
        )}
        {profile.teamSize && profile.city && (
          <Text color="fg.subtle">&#183;</Text>
        )}
        {profile.city && (
          <HStack gap="1">
            <MapPin size={12} />
            <Text>{profile.city}</Text>
          </HStack>
        )}
      </HStack>

      {/* Bio */}
      {profile.bio && (
        <Box px="4">
          <Text fontSize="sm" color="fg.muted" fontStyle="italic" lineHeight="1.5">
            <Text as="span" color="brand.400" fontWeight="600" fontStyle="normal">&ldquo; </Text>
            {profile.bio}
            <Text as="span" color="brand.400" fontWeight="600" fontStyle="normal"> &rdquo;</Text>
          </Text>
        </Box>
      )}

      {/* Looking for badges */}
      <Wrap gap="2" justify="center">
        {profile.lookingFor.map((item) => (
          <Badge
            key={item}
            fontSize="xs"
            px="3"
            py="1"
            borderRadius="full"
            bg="brand.50"
            color="brand.600"
            fontWeight="500"
          >
            <CircleCheck size={12} />
            Busca: {item}
          </Badge>
        ))}
      </Wrap>

      {/* Interests badges */}
      {profile.interests.length > 0 && (
        <Wrap gap="2" justify="center">
          {profile.interests.map((item) => (
            <Badge
              key={item}
              fontSize="xs"
              px="3"
              py="1"
              borderRadius="full"
              variant="outline"
              borderColor="#E0E0E0"
              color="fg.DEFAULT"
              fontWeight="500"
            >
              <Box w="1.5" h="1.5" borderRadius="full" bg="#F5A623" />
              {item}
            </Badge>
          ))}
        </Wrap>
      )}

      {/* Industries badges */}
      {profile.industries.length > 0 && (
        <Wrap gap="2" justify="center">
          {profile.industries.map((item) => (
            <Badge
              key={item}
              fontSize="xs"
              px="3"
              py="1"
              borderRadius="full"
              variant="outline"
              borderColor="#E0E0E0"
              color="fg.DEFAULT"
              fontWeight="500"
            >
              <Box w="1.5" h="1.5" borderRadius="full" bg="success.400" />
              {item}
            </Badge>
          ))}
        </Wrap>
      )}

      {/* View full profile */}
      <Button asChild variant="ghost" size="sm" color="brand.500" fontWeight="500">
        <Link href={`/profile/${profile.id}`}>
          Ver perfil completo
          <ChevronRight size={14} />
        </Link>
      </Button>
    </Stack>
  )
}

export function SwipeCards({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [matchInfo, setMatchInfo] = useState<{ name: string } | null>(null)

  const currentProfile = profiles[currentIndex]

  const handleLike = useCallback(async () => {
    if (!currentProfile || loading) return
    setLoading(true)
    trackEvent('swipe_like', { target_id: currentProfile.id })

    const result = await likeProfile(currentProfile.id)

    if (result.match) {
      trackEvent('match_created', { target_id: currentProfile.id })
      setMatchInfo({ name: result.matchedName ?? currentProfile.fullName })
    } else {
      setCurrentIndex((i) => i + 1)
    }

    setLoading(false)
  }, [currentProfile, loading])

  const handlePass = useCallback(() => {
    if (!currentProfile || loading) return
    trackEvent('swipe_pass', { target_id: currentProfile.id })
    setCurrentIndex((i) => i + 1)
  }, [currentProfile, loading])

  const handleContinueAfterMatch = useCallback(() => {
    setMatchInfo(null)
    setCurrentIndex((i) => i + 1)
  }, [])

  if (matchInfo) {
    return (
      <Container maxW="sm" px="0">
        <Box bg="white" borderRadius="2xl" borderWidth="1px" borderColor="surface.border" boxShadow="0 2px 12px rgba(0,0,0,0.06)" overflow="hidden">
          <MatchBanner name={matchInfo.name} onContinue={handleContinueAfterMatch} />
        </Box>
      </Container>
    )
  }

  if (!currentProfile) {
    return (
      <Container maxW="sm" px="0">
        <Stack align="center" gap="5" py="10" textAlign="center">
          <Box w="120px" h="100px">
            <svg viewBox="0 0 120 100" width="120" height="100">
              <circle cx="60" cy="50" r="40" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="2" />
              <circle cx="60" cy="42" r="12" fill="none" stroke="#999999" strokeWidth="1.5" />
              <path d="M42 68 Q60 80 78 68" fill="none" stroke="#999999" strokeWidth="1.5" />
              <line x1="75" y1="25" x2="85" y2="15" stroke="#999999" strokeWidth="1.5" />
              <line x1="85" y1="25" x2="75" y2="15" stroke="#999999" strokeWidth="1.5" />
            </svg>
          </Box>
          <Heading size="lg">No hay más perfiles</Heading>
          <Text color="fg.muted" fontSize="sm">
            Ya viste a todos los miembros disponibles. Volvé más tarde.
          </Text>
        </Stack>
      </Container>
    )
  }

  const remaining = profiles.length - currentIndex - 1

  return (
    <Container maxW="sm" px="0">
      <Stack gap="4">
        {/* Profile card */}
        <Box
          bg="white"
          borderWidth="1px"
          borderColor="surface.border"
          borderRadius="2xl"
          px="5"
          py="4"
          boxShadow="0 2px 12px rgba(0,0,0,0.06)"
        >
          <ProfileCard profile={currentProfile} />
        </Box>

        {/* Action buttons */}
        <HStack gap="3">
          <Button
            size="lg"
            variant="outline"
            onClick={handlePass}
            disabled={loading}
            flex="1"
            borderRadius="full"
            borderColor="#E0E0E0"
            color="fg.muted"
            fontWeight="500"
          >
            <X size={18} />
            Pasar
          </Button>
          <Button
            size="lg"
            colorPalette="brand"
            onClick={handleLike}
            loading={loading}
            flex="1.5"
            borderRadius="full"
            fontWeight="600"
          >
            <Zap size={18} />
            Conectar
          </Button>
        </HStack>

        {/* Counter */}
        <Text textAlign="center" fontSize="sm" color="fg.subtle">
          {remaining} {remaining === 1 ? 'perfil restante' : 'perfiles restantes'}
        </Text>
      </Stack>
    </Container>
  )
}

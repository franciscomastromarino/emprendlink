export const dynamic = 'force-dynamic'

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
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Profile } from '@prisma/client'
import { Compass, CircleCheck, MessageCircle } from 'lucide-react'

function EmptyMatchesSvg() {
  return (
    <Box w="180px" h="150px" mx="auto">
      <svg viewBox="0 0 180 150" width="180" height="150">
        <defs>
          <radialGradient id="emptyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2E5EA6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2E5EA6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="90" cy="75" r="65" fill="url(#emptyGlow)" />
        <g transform="translate(50, 45)">
          <circle cx="0" cy="0" r="16" fill="#F5F5F5" stroke="#2E5EA6" strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx="0" cy="-4" r="6" fill="#1B3B6F" />
          <path d="M-8 8 Q0 16 8 8" fill="none" stroke="#1B3B6F" strokeWidth="1.5" />
        </g>
        <g transform="translate(130, 45)">
          <circle cx="0" cy="0" r="16" fill="#F5F5F5" stroke="#2E5EA6" strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx="0" cy="-4" r="6" fill="#3B7DDD" />
          <path d="M-8 8 Q0 16 8 8" fill="none" stroke="#3B7DDD" strokeWidth="1.5" />
        </g>
        <line x1="66" y1="45" x2="114" y2="45" stroke="#2E5EA6" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x="90" y="50" textAnchor="middle" fill="#2E5EA6" fontSize="14" fontWeight="bold" opacity="0.5">?</text>
        <g opacity="0.4">
          <path d="M85 95 L90 102 L95 95 Q95 90 90 90 Q85 90 85 95Z" fill="#1B3B6F">
            <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M70 110 L73 115 L76 110 Q76 107 73 107 Q70 107 70 110Z" fill="#3B7DDD" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite" />
          </path>
          <path d="M105 108 L108 113 L111 108 Q111 105 108 105 Q105 105 105 108Z" fill="#8DB8F2" opacity="0.3">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    </Box>
  )
}

function MatchCard({ profile }: { profile: Profile }) {
  return (
    <Box
      bg="white"
      borderBottomWidth="1px"
      borderColor="surface.border"
      py="4"
      px="1"
    >
      <HStack gap="3" align="start">
        {/* Avatar with green ring (matched) */}
        <Box flexShrink={0} position="relative">
          <Box
            borderRadius="full"
            p="0.5"
            borderWidth="2px"
            borderColor="surface.border"
          >
            <Avatar.Root size="lg">
              <Avatar.Image src={profile.avatarUrl || undefined} borderRadius="full" />
              <Avatar.Fallback>{profile.fullName[0]}</Avatar.Fallback>
            </Avatar.Root>
          </Box>
          <Box
            position="absolute"
            bottom="1"
            right="0"
            w="3"
            h="3"
            borderRadius="full"
            bg="success.400"
            borderWidth="2px"
            borderColor="white"
          />
        </Box>

        {/* Content */}
        <Stack gap="1" flex="1" minW="0">
          <Stack gap="0">
            <HStack gap="2">
              <Heading size="sm" lineHeight="1.3">{profile.fullName}</Heading>
              <Badge
                fontSize="2xs"
                px="2"
                py="0.5"
                borderRadius="full"
                bg="success.50"
                color="success.600"
                fontWeight="600"
              >
                Match
              </Badge>
            </HStack>
            <Text fontSize="sm" color="fg.muted" lineHeight="1.3">
              {profile.role} en{' '}
              {profile.startupUrl ? (
                <ChakraLink href={profile.startupUrl} target="_blank" color="brand.400" fontWeight="500">
                  {profile.startup}
                </ChakraLink>
              ) : (
                <Text as="span" fontWeight="500">{profile.startup}</Text>
              )}
            </Text>
          </Stack>

          {/* Status */}
          <HStack gap="1" mt="0.5">
            <CircleCheck size={13} color="success.400" />
            <Text fontSize="xs" color="success.400" fontWeight="500">
              Disponible para conectar
            </Text>
          </HStack>

          {/* Badges */}
          <Wrap gap="1.5" mt="1">
            {profile.lookingFor.map((item) => (
              <Badge
                key={item}
                fontSize="2xs"
                px="2"
                py="0.5"
                borderRadius="full"
                bg="brand.50"
                color="brand.600"
                fontWeight="500"
              >
                {item}
              </Badge>
            ))}
          </Wrap>

          {/* Actions */}
          <HStack gap="2" mt="2">
            <Box flex="1" />
            <Button asChild variant="ghost" size="xs" color="brand.500" fontWeight="500" px="2">
              <Link href={`/profile/${profile.id}`}>Ver perfil</Link>
            </Button>
            <Button
              asChild
              colorPalette="green"
              size="sm"
              borderRadius="full"
              px="4"
            >
              <Link href={`/profile/${profile.id}`}>
                <MessageCircle size={14} />
                Contactar
              </Link>
            </Button>
          </HStack>
        </Stack>
      </HStack>
    </Box>
  )
}

export default async function MatchesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const myLikes = await prisma.like.findMany({
    where: { fromUser: session.user.id },
    select: { toUser: true },
  })
  const likedIds = myLikes.map((l) => l.toUser)

  let matchedProfiles: Profile[] = []

  if (likedIds.length > 0) {
    const mutualLikes = await prisma.like.findMany({
      where: {
        fromUser: { in: likedIds },
        toUser: session.user.id,
      },
      select: { fromUser: true },
    })
    const matchedIds = mutualLikes.map((l) => l.fromUser)

    if (matchedIds.length > 0) {
      matchedProfiles = await prisma.profile.findMany({
        where: { id: { in: matchedIds } },
        orderBy: { updatedAt: 'desc' },
      })
    }
  }

  return (
    <Container maxW="lg" py="6">
      <Stack gap="5">
        <Stack gap="1">
          <Heading size="xl">Matches ({matchedProfiles.length})</Heading>
          <Text fontSize="sm" color="fg.muted">
            Personas con interés mutuo
          </Text>
        </Stack>

        {matchedProfiles.length === 0 ? (
          <Stack align="center" gap="4" py="8" textAlign="center">
            <EmptyMatchesSvg />
            <Heading size="md" color="fg.muted">
              Todavía no tenés matches.
            </Heading>
            <Text color="fg.subtle" maxW="xs" fontSize="sm">
              Explorá perfiles en Descubrir y dale like a los que te interesen. Cuando el interés sea mutuo, aparecerán acá.
            </Text>
            <Button asChild colorPalette="brand" size="lg" mt="2" borderRadius="full" px="6">
              <Link href="/discover">
                <Compass size={18} />
                Ir a Descubrir
              </Link>
            </Button>
          </Stack>
        ) : (
          <Stack gap="0">
            {matchedProfiles.map((profile) => (
              <MatchCard key={profile.id} profile={profile} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  )
}

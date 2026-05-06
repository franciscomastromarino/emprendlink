import {
  Avatar,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Link as ChakraLink,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react'
import Link from 'next/link'
import type { Profile } from '@prisma/client'
import { LikeButton } from '@/components/like-button'
import { CircleCheck } from 'lucide-react'

export function ProfileCard({ profile, liked = false }: { profile: Profile; liked?: boolean }) {
  return (
    <Box
      bg="white"
      borderBottomWidth="1px"
      borderColor="surface.border"
      py="4"
      px="1"
    >
      <HStack gap="3" align="start">
        {/* Avatar with colored ring */}
        <Box flexShrink={0} position="relative">
          <Box
            borderRadius="full"
            p="0.5"
            borderWidth="2px"
            borderColor="surface.border"
          >
            <Avatar.Root size="lg">
              <Avatar.Image src={profile.avatarUrl ?? undefined} borderRadius="full" />
              <Avatar.Fallback>{profile.fullName[0]}</Avatar.Fallback>
            </Avatar.Root>
          </Box>
          {/* Online indicator */}
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
            <Heading size="sm" lineHeight="1.3">{profile.fullName}</Heading>
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

          {/* Status line */}
          {profile.lookingFor.length > 0 && (
            <HStack gap="1" mt="0.5">
              <CircleCheck size={13} color="success.400" />
              <Text fontSize="xs" color="success.400" fontWeight="500">
                Disponible para conectar
              </Text>
            </HStack>
          )}

          {/* Badges row */}
          <Wrap gap="1.5" mt="1">
            {profile.lookingFor.map((item) => (
              <Badge
                key={`lf-${item}`}
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
            {profile.interests.slice(0, 2).map((item) => (
              <Badge
                key={`int-${item}`}
                fontSize="2xs"
                px="2"
                py="0.5"
                borderRadius="full"
                bg="accent.50"
                color="accent.700"
                fontWeight="500"
              >
                {item}
              </Badge>
            ))}
          </Wrap>

          {/* Actions row */}
          <HStack gap="2" mt="2">
            {profile.teamSize && (
              <Text fontSize="xs" color="fg.subtle">
                {profile.teamSize} {profile.teamSize === 'Solo founder' ? '' : 'personas'}
              </Text>
            )}
            <Box flex="1" />
            <Button asChild variant="ghost" size="xs" color="brand.500" fontWeight="500" px="2">
              <Link href={`/profile/${profile.id}`}>Ver perfil</Link>
            </Button>
            <LikeButton targetId={profile.id} initialLiked={liked} />
          </HStack>
        </Stack>
      </HStack>
    </Box>
  )
}

export const dynamic = 'force-dynamic'

import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Heading,
  Link as ChakraLink,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { ConnectButton } from './connect-button'
import { LikeButton } from '@/components/like-button'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params
  const profile = await prisma.profile.findUnique({ where: { id } })

  if (!profile || (!profile.visible && profile.id !== session.user.id)) {
    notFound()
  }

  const isOwn = profile.id === session.user.id

  // Check like state
  let isMatch = false
  let alreadyLiked = false
  if (!isOwn) {
    const [iLikedThem, theyLikedMe] = await Promise.all([
      prisma.like.findUnique({
        where: { fromUser_toUser: { fromUser: session.user.id, toUser: id } },
      }),
      prisma.like.findUnique({
        where: { fromUser_toUser: { fromUser: id, toUser: session.user.id } },
      }),
    ])
    alreadyLiked = !!iLikedThem
    isMatch = !!(iLikedThem && theyLikedMe)
  }

  return (
    <Box position="relative" overflow="hidden">
      {/* Gradient glow behind avatar */}
      <Box
        position="absolute"
        top="-80px"
        left="50%"
        transform="translateX(-50%)"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(46,94,166,0.1) 0%, rgba(46,94,166,0.03) 40%, transparent 70%)"
        pointerEvents="none"
      />

      <Container maxW="sm" py="6" position="relative">
        <Stack gap="6">
          <Button asChild variant="ghost" alignSelf="start" size="sm" color="fg.muted">
            <Link href="/feed">
              <ArrowLeft size={16} />
              Volver
            </Link>
          </Button>

          <Stack align="center" gap="3">
            <Box
              borderRadius="full"
              p="0.5"
              borderWidth="2px"
              borderColor="surface.border"
              display="inline-flex"
            >
              <Avatar.Root size="2xl">
                <Avatar.Image src={profile.avatarUrl || undefined} />
                <Avatar.Fallback>{profile.fullName[0]}</Avatar.Fallback>
              </Avatar.Root>
            </Box>
            <Heading size="lg" textAlign="center">{profile.fullName}</Heading>
            <Text color="fg.muted">
              {profile.role} en {profile.startup}
            </Text>
            {profile.startupUrl && (
              <ChakraLink href={profile.startupUrl} target="_blank" color="brand.400" fontSize="sm">
                {profile.startupUrl.replace(/^https?:\/\//, '')}
              </ChakraLink>
            )}
            {profile.city && (
              <Text fontSize="sm" color="fg.muted" display="flex" alignItems="center" gap="1">
                <MapPin size={14} />
                {profile.city}
              </Text>
            )}
          </Stack>

          {isMatch && (
            <Badge colorPalette="green" alignSelf="center" size="lg" px="4" py="1">
              Match mutuo
            </Badge>
          )}

          {profile.bio && (
            <Box bg="surface.card" borderRadius="xl" p="4" borderWidth="1px" borderColor="surface.border">
              <Text textAlign="center" fontStyle="italic" color="fg.muted">
                &ldquo;{profile.bio}&rdquo;
              </Text>
            </Box>
          )}

          <Box bg="surface.card" borderRadius="xl" p="4" borderWidth="1px" borderColor="surface.border">
            <Stack gap="4">
              <Stack gap="2">
                <Heading size="xs" color="fg.muted">Busca</Heading>
                <Wrap gap="2">
                  {profile.lookingFor.map((item) => (
                    <Badge key={item} colorPalette="brand">{item}</Badge>
                  ))}
                </Wrap>
              </Stack>

              <Stack gap="2">
                <Heading size="xs" color="fg.muted">Intereses</Heading>
                <Wrap gap="2">
                  {profile.interests.map((item) => (
                    <Badge key={item} colorPalette="brand" variant="outline">{item}</Badge>
                  ))}
                </Wrap>
              </Stack>

              <Stack gap="2">
                <Heading size="xs" color="fg.muted">Industrias</Heading>
                <Wrap gap="2">
                  {profile.industries.map((item) => (
                    <Badge key={item} colorPalette="teal" variant="outline">{item}</Badge>
                  ))}
                </Wrap>
              </Stack>
            </Stack>
          </Box>

          {profile.linkedinUrl && (
            <Button asChild variant="outline" size="sm" alignSelf="center">
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} />
                Ver LinkedIn
              </a>
            </Button>
          )}

          {!isOwn && isMatch && <ConnectButton targetId={profile.id} />}

          {!isOwn && !isMatch && !alreadyLiked && (
            <LikeButton targetId={profile.id} variant="solid" size="lg" />
          )}

          {!isOwn && !isMatch && alreadyLiked && (
            <Box bg="surface.card" borderRadius="xl" p="4" borderWidth="1px" borderColor="surface.border">
              <Text textAlign="center" color="fg.muted" fontSize="sm">
                Ya le diste like. Necesitás un match mutuo para conectar por WhatsApp.
              </Text>
            </Box>
          )}

          {isOwn && (
            <Button asChild variant="outline">
              <Link href="/settings">Editar perfil</Link>
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  )
}

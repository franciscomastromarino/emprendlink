'use client'

import { Box, Container, HStack, Text, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, LayoutGrid, Heart, Settings, Zap } from 'lucide-react'

const LEFT_ITEMS = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/feed', label: 'Explorar', icon: LayoutGrid },
]

const RIGHT_ITEMS = [
  { href: '/matches', label: 'Matches', icon: Heart },
  { href: '/settings', label: 'Perfil', icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) return null

  const isDiscoverActive = pathname.startsWith('/discover')

  return (
    <>
    {/* Spacer to prevent content from hiding behind fixed navbar */}
    <Box h="72px" />
    <Box
      as="nav"
      aria-label="Navegación principal"
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg="white"
      borderTopWidth="1px"
      borderColor="surface.border"
      zIndex="10"
      pb="env(safe-area-inset-bottom)"
    >
      <Container maxW="6xl">
        <HStack justify="center" py="2" px="4" gap="0" position="relative">
          {/* Left nav items */}
          {LEFT_ITEMS.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link key={item.label} href={item.href} aria-current={isActive ? 'page' : undefined}>
                <VStack gap="0.5" align="center" minW="16" px="2">
                  <Icon
                    size={20}
                    color={isActive ? '#2E5EA6' : '#999999'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <Text
                    fontSize="2xs"
                    color={isActive ? 'brand.500' : 'fg.muted'}
                    fontWeight={isActive ? '600' : '400'}
                  >
                    {item.label}
                  </Text>
                </VStack>
              </Link>
            )
          })}

          {/* Center discover button — Ring Fill */}
          <Box px="4">
            <Link href="/discover" aria-current={isDiscoverActive ? 'page' : undefined} aria-label="Descubrir">
              <VStack gap="0.5" align="center">
                <Box
                  position="relative"
                  w="16"
                  h="16"
                  mt="-6"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {/* Spinning glow border */}
                  <Box
                    position="absolute"
                    inset="0"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      inset="-50%"
                      css={{
                        background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, #F5A623 75%, #FFD700 85%, #F5A623 95%, transparent 100%)',
                        animation: 'spinGlow 2.5s linear infinite',
                      }}
                    />
                    {/* Inner mask to create ring */}
                    <Box
                      position="absolute"
                      inset="2.5px"
                      borderRadius="full"
                      bg="white"
                    />
                  </Box>
                  {/* Inner circle */}
                  <Box
                    position="relative"
                    w="12"
                    h="12"
                    borderRadius="full"
                    bg={isDiscoverActive ? '#2E5EA6' : 'linear-gradient(135deg, #F5A623, #E8932F)'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow={isDiscoverActive
                      ? '0 2px 8px #2E5EA6'
                      : '0 4px 12px #F5A623'
                    }
                    borderWidth={isDiscoverActive ? '2px' : '0px'}
                    borderColor="#1B3B6F"
                  >
                    <Zap
                      size={18}
                      color={isDiscoverActive ? '#F5A623' : 'white'}
                      fill={isDiscoverActive ? '#F5A623' : 'white'}
                      strokeWidth={2.5}
                    />
                  </Box>
                </Box>
                <Text
                  fontSize="2xs"
                  color={isDiscoverActive ? '#F5A623' : '#E8932F'}
                  fontWeight="600"
                >
                  Descubrir
                </Text>
              </VStack>
            </Link>
          </Box>

          {/* Right nav items */}
          {RIGHT_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined}>
                <VStack gap="0.5" align="center" minW="16" px="2">
                  <Icon
                    size={20}
                    color={isActive ? '#2E5EA6' : '#999999'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <Text
                    fontSize="2xs"
                    color={isActive ? 'brand.500' : 'fg.muted'}
                    fontWeight={isActive ? '600' : '400'}
                  >
                    {item.label}
                  </Text>
                </VStack>
              </Link>
            )
          })}
        </HStack>
      </Container>
    </Box>
    </>
  )
}

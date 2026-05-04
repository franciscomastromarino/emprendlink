'use client'

import {
  Box,
  Button,
  HStack,
  Input,
  Stack,
  Text,
  Heading,
} from '@chakra-ui/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useCallback, useRef, useEffect } from 'react'
import { INTENTS, INDUSTRIES, ROLES } from '@/lib/constants'
import { ChipSelect } from '@/components/chip-select'
import { Search, ChevronDown, X } from 'lucide-react'

type FilterType = 'industria' | 'rol' | 'queBusca' | null

export function FeedFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [lookingFor, setLookingFor] = useState<string[]>(
    searchParams.get('lookingFor')?.split(',').filter(Boolean) ?? []
  )
  const [industries, setIndustries] = useState<string[]>(
    searchParams.get('industries')?.split(',').filter(Boolean) ?? []
  )
  const [roles, setRoles] = useState<string[]>(
    searchParams.get('roles')?.split(',').filter(Boolean) ?? []
  )
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [openDropdown, setOpenDropdown] = useState<FilterType>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeCount = lookingFor.length + industries.length + roles.length

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (lookingFor.length) params.set('lookingFor', lookingFor.join(','))
    if (industries.length) params.set('industries', industries.join(','))
    if (roles.length) params.set('roles', roles.join(','))
    if (search.trim()) params.set('search', search.trim())
    router.push(`/feed?${params.toString()}`)
    setOpenDropdown(null)
  }, [lookingFor, industries, roles, search, router])

  const clearFilters = useCallback(() => {
    setLookingFor([])
    setIndustries([])
    setRoles([])
    setSearch('')
    router.push('/feed')
    setOpenDropdown(null)
  }, [router])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Auto-apply on search enter
  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters()
  }

  return (
    <Stack gap="3" w="full">
      {/* Search bar */}
      <Box position="relative">
        <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color="fg.subtle" zIndex="1">
          <Search size={16} />
        </Box>
        <Input
          placeholder="Buscar emprendedores..."
          aria-label="Buscar emprendedores"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKey}
          bg="surface.elevated"
          borderColor="transparent"
          borderRadius="xl"
          pl="9"
          fontSize="sm"
          _placeholder={{ color: 'fg.subtle' }}
          _focus={{ borderColor: 'brand.400', bg: 'white' }}
        />
      </Box>

      {/* Filter pills row */}
      <Box position="relative" ref={dropdownRef}>
        <HStack gap="2" overflowX="auto" pb="1" css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
          <FilterPill
            label="Industria"
            count={industries.length}
            isOpen={openDropdown === 'industria'}
            onClick={() => setOpenDropdown(openDropdown === 'industria' ? null : 'industria')}
          />
          <FilterPill
            label="Rol"
            count={roles.length}
            isOpen={openDropdown === 'rol'}
            onClick={() => setOpenDropdown(openDropdown === 'rol' ? null : 'rol')}
          />
          <FilterPill
            label="Qué busca"
            count={lookingFor.length}
            isOpen={openDropdown === 'queBusca'}
            onClick={() => setOpenDropdown(openDropdown === 'queBusca' ? null : 'queBusca')}
          />
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              color="fg.muted"
              onClick={clearFilters}
              flexShrink={0}
              aria-label="Limpiar todos los filtros"
            >
              <X size={14} />
              Limpiar
            </Button>
          )}
        </HStack>

        {/* Dropdown panels */}
        {openDropdown && (
          <Box
            role="dialog"
            aria-label={`Filtro: ${openDropdown}`}
            position="absolute"
            top="100%"
            left="0"
            right="0"
            mt="2"
            bg="white"
            borderRadius="xl"
            boxShadow="0 4px 20px rgba(0,0,0,0.12)"
            borderWidth="1px"
            borderColor="surface.border"
            p="4"
            zIndex="20"
          >
            {openDropdown === 'industria' && (
              <Stack gap="3">
                <Heading size="xs">Industria</Heading>
                <ChipSelect options={INDUSTRIES} value={industries} onChange={setIndustries} max={10} colorScheme="green" />
              </Stack>
            )}
            {openDropdown === 'rol' && (
              <Stack gap="3">
                <Heading size="xs">Rol</Heading>
                <ChipSelect options={ROLES} value={roles} onChange={setRoles} max={10} colorScheme="blue" />
              </Stack>
            )}
            {openDropdown === 'queBusca' && (
              <Stack gap="3">
                <Heading size="xs">Qué busca</Heading>
                <ChipSelect options={INTENTS} value={lookingFor} onChange={setLookingFor} max={7} colorScheme="blue" />
              </Stack>
            )}
            <Button onClick={applyFilters} colorPalette="brand" size="sm" mt="3" w="full" borderRadius="full">
              Aplicar filtros
            </Button>
          </Box>
        )}
      </Box>
    </Stack>
  )
}

function FilterPill({
  label,
  count,
  isOpen,
  onClick,
}: {
  label: string
  count: number
  isOpen: boolean
  onClick: () => void
}) {
  const hasActive = count > 0
  return (
    <Button
      size="xs"
      variant={hasActive ? 'solid' : 'outline'}
      colorPalette={hasActive ? 'brand' : undefined}
      borderRadius="full"
      onClick={onClick}
      flexShrink={0}
      px="3"
      fontWeight="500"
      bg={hasActive ? undefined : isOpen ? 'brand.50' : 'transparent'}
      borderColor={isOpen ? 'brand.400' : hasActive ? undefined : 'surface.border'}
      color={hasActive ? undefined : 'fg.DEFAULT'}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      {label}
      {hasActive && (
        <Text as="span" ml="1" fontSize="2xs" opacity="0.8">
          ({count})
        </Text>
      )}
      <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
    </Button>
  )
}

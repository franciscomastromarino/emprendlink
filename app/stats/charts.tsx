'use client'

import {
  Box,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
} from 'recharts'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'
import {
  Users,
  UserCheck,
  Heart,
  Handshake,
  MessageCircle,
  TrendingUp,
  Percent,
} from 'lucide-react'
import type { ReactNode } from 'react'

// --- Types ---
type KV = { name: string; value: number }
type WeekCount = { week: string; count: number }
type FunnelStep = { step: string; value: number }

interface StatsData {
  kpis: {
    totalUsers: number
    completedProfiles: number
    onboardingRate: number
    totalLikes: number
    totalMatches: number
    matchRate: number
    totalConnections: number
  }
  distributions: {
    roles: KV[]
    industries: KV[]
    lookingFor: KV[]
    interests: KV[]
    teamSizes: KV[]
    cities: KV[]
  }
  activity: {
    registrations: WeekCount[]
    likes: WeekCount[]
    connections: WeekCount[]
  }
  funnel: FunnelStep[]
}

// --- City coordinates (LATAM) ---
const CITY_COORDS: Record<string, [number, number]> = {
  'Buenos Aires': [-58.38, -34.6],
  'Córdoba': [-64.18, -31.42],
  'Rosario': [-60.65, -32.95],
  'Mendoza': [-68.84, -32.89],
  'La Plata': [-57.95, -34.92],
  'Mar del Plata': [-57.55, -38.0],
  'Tucumán': [-65.2, -26.82],
  'Salta': [-65.41, -24.79],
  'Santa Fe': [-60.7, -31.63],
  'Pergamino': [-60.57, -33.9],
  'Neuquén': [-68.06, -38.95],
  'Bariloche': [-71.3, -41.15],
  'Bahía Blanca': [-62.27, -38.72],
  'Corrientes': [-58.83, -27.47],
  'Resistencia': [-59.0, -27.45],
  'Posadas': [-55.9, -27.37],
  'San Juan': [-68.54, -31.54],
  'San Luis': [-66.35, -33.3],
  'Paraná': [-60.52, -31.73],
  'Santiago del Estero': [-64.26, -27.78],
  'Ushuaia': [-68.3, -54.8],
  // LATAM cities
  'CDMX': [-99.13, 19.43],
  'Ciudad de México': [-99.13, 19.43],
  'Bogotá': [-74.07, 4.71],
  'Lima': [-77.04, -12.05],
  'Santiago': [-70.67, -33.45],
  'Montevideo': [-56.16, -34.9],
  'São Paulo': [-46.63, -23.55],
  'Medellín': [-75.56, 6.25],
  'Guadalajara': [-103.35, 20.67],
  'Quito': [-78.52, -0.18],
}

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json'

const CHART_COLORS = [
  '#2E5EA6', '#3B7DDD', '#5A9AE8', '#8DB8F2', '#C5D9F8',
  '#F5A623', '#E8932F', '#D4820A', '#22c55e', '#4ade80',
]

const FUNNEL_COLORS = ['#2E5EA6', '#3B7DDD', '#5A9AE8', '#F5A623', '#22c55e']

// --- KPI Card ---
function KpiCard({ label, value, icon, sub }: { label: string; value: string | number; icon: ReactNode; sub?: string }) {
  return (
    <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
      <HStack gap="3" mb="2">
        <Box color="brand.500">{icon}</Box>
        <Text fontSize="xs" fontWeight="600" color="fg.muted" textTransform="uppercase" letterSpacing="wide">
          {label}
        </Text>
      </HStack>
      <Text fontSize="3xl" fontWeight="700" color="brand.600" lineHeight="1">
        {value}
      </Text>
      {sub && (
        <Text fontSize="xs" color="fg.subtle" mt="1">{sub}</Text>
      )}
    </Box>
  )
}

// --- Section wrapper ---
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap="4">
      <Heading size="md" color="brand.600">{title}</Heading>
      {children}
    </Stack>
  )
}

// --- Horizontal bar chart ---
function HBar({ data, color = '#2E5EA6' }: { data: KV[]; color?: string }) {
  if (data.length === 0) return <Text fontSize="sm" color="fg.subtle">Sin datos</Text>
  return (
    <ResponsiveContainer width="100%" height={data.length * 36 + 20}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: '#666' }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 13 }}
          formatter={(v) => [v, 'Total']}
        />
        <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- City Map ---
function CityMap({ cities }: { cities: KV[] }) {
  const maxVal = Math.max(...cities.map((c) => c.value), 1)

  // Filter to cities we have coords for
  const mapped = cities
    .filter((c) => CITY_COORDS[c.name])
    .map((c) => ({
      name: c.name,
      value: c.value,
      coords: CITY_COORDS[c.name],
    }))

  // Unknown cities
  const unknown = cities.filter((c) => !CITY_COORDS[c.name])

  return (
    <Stack gap="3">
      <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" overflow="hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 450,
            center: [-63, -35],
          }}
          width={500}
          height={500}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies
                .filter((geo) => {
                  const name = geo.properties.name
                  return [
                    'Argentina', 'Chile', 'Uruguay', 'Paraguay',
                    'Bolivia', 'Brazil', 'Peru', 'Colombia',
                    'Ecuador', 'Venezuela', 'Mexico',
                  ].includes(name)
                })
                .map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={geo.properties.name === 'Argentina' ? '#E8F0FE' : '#F5F5F5'}
                    stroke="#C5D9F8"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: geo.properties.name === 'Argentina' ? '#C5D9F8' : '#E8E8E8' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
            }
          </Geographies>
          {mapped.map((city) => {
            const r = 6 + (city.value / maxVal) * 18
            return (
              <Marker key={city.name} coordinates={city.coords}>
                <circle r={r} fill="#2E5EA6" fillOpacity={0.6} stroke="#1B3B6F" strokeWidth={1} />
                <circle r={r} fill="none" stroke="#2E5EA6" strokeWidth={1} strokeOpacity={0.3}>
                  <animate attributeName="r" from={String(r)} to={String(r + 6)} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                <text
                  textAnchor="middle"
                  y={-r - 4}
                  style={{ fontSize: 10, fontWeight: 600, fill: '#1B3B6F' }}
                >
                  {city.name} ({city.value})
                </text>
              </Marker>
            )
          })}
        </ComposableMap>
      </Box>
      {unknown.length > 0 && (
        <Box bg="surface.elevated" borderRadius="lg" p="3">
          <Text fontSize="xs" color="fg.subtle">
            Otras ciudades:{' '}
            {unknown.map((c) => `${c.name} (${c.value})`).join(', ')}
          </Text>
        </Box>
      )}
    </Stack>
  )
}

// --- Main component ---
export function StatsCharts({ data }: { data: StatsData }) {
  const { kpis, distributions, activity, funnel } = data

  return (
    <Stack gap="8">
      {/* KPIs */}
      <Section title="Resumen general">
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
          <KpiCard label="Usuarios" value={kpis.totalUsers} icon={<Users size={18} />} />
          <KpiCard
            label="Onboarding"
            value={kpis.completedProfiles}
            icon={<UserCheck size={18} />}
            sub={`${kpis.onboardingRate}% completaron`}
          />
          <KpiCard label="Likes" value={kpis.totalLikes} icon={<Heart size={18} />} />
          <KpiCard
            label="Matches"
            value={kpis.totalMatches}
            icon={<Handshake size={18} />}
            sub={`${kpis.matchRate}% tasa de match`}
          />
          <KpiCard label="Conexiones WhatsApp" value={kpis.totalConnections} icon={<MessageCircle size={18} />} />
          <KpiCard label="Tasa onboarding" value={`${kpis.onboardingRate}%`} icon={<Percent size={18} />} />
          <KpiCard label="Tasa de match" value={`${kpis.matchRate}%`} icon={<TrendingUp size={18} />} />
        </SimpleGrid>
      </Section>

      {/* Funnel */}
      <Section title="Embudo de conversión">
        <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
          <Stack gap="3">
            {funnel.map((step, i) => {
              const pct = funnel[0].value > 0 ? Math.round((step.value / funnel[0].value) * 100) : 0
              return (
                <Box key={step.step}>
                  <HStack justify="space-between" mb="1">
                    <Text fontSize="sm" fontWeight="500">{step.step}</Text>
                    <Text fontSize="sm" fontWeight="600" color="brand.500">
                      {step.value} ({pct}%)
                    </Text>
                  </HStack>
                  <Box bg="surface.elevated" borderRadius="full" h="6" overflow="hidden">
                    <Box
                      bg={FUNNEL_COLORS[i] || '#2E5EA6'}
                      h="full"
                      borderRadius="full"
                      style={{ width: `${pct}%` }}
                      transition="width 0.5s"
                    />
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </Box>
      </Section>

      {/* City Map */}
      {distributions.cities.length > 0 && (
        <Section title="Mapa por ciudad">
          <CityMap cities={distributions.cities} />
        </Section>
      )}

      {/* Distributions */}
      <Section title="Distribuciones">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Roles</Text>
            <HBar data={distributions.roles} color="#2E5EA6" />
          </Box>
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Industrias</Text>
            <HBar data={distributions.industries} color="#3B7DDD" />
          </Box>
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Qué buscan</Text>
            <HBar data={distributions.lookingFor} color="#F5A623" />
          </Box>
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Intereses</Text>
            <HBar data={distributions.interests} color="#22c55e" />
          </Box>
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Tamaño de equipo</Text>
            <HBar data={distributions.teamSizes} color="#5A9AE8" />
          </Box>
          <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
            <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Top ciudades</Text>
            <HBar data={distributions.cities.slice(0, 10)} color="#1B3B6F" />
          </Box>
        </SimpleGrid>
      </Section>

      {/* Activity over time */}
      <Section title="Actividad en el tiempo">
        <SimpleGrid columns={{ base: 1, md: 1 }} gap="4">
          {activity.registrations.length > 0 && (
            <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
              <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Registros por semana</Text>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activity.registrations} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                  <Line type="monotone" dataKey="count" stroke="#2E5EA6" strokeWidth={2} dot={{ r: 3 }} name="Registros" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
          {activity.likes.length > 0 && (
            <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
              <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Likes por semana</Text>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activity.likes} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                  <Line type="monotone" dataKey="count" stroke="#F5A623" strokeWidth={2} dot={{ r: 3 }} name="Likes" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
          {activity.connections.length > 0 && (
            <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" p="5">
              <Text fontSize="sm" fontWeight="600" mb="3" color="fg.muted">Conexiones WhatsApp por semana</Text>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activity.connections} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                  <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Conexiones" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </SimpleGrid>
      </Section>
    </Stack>
  )
}

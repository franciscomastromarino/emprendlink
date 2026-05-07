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
} from 'recharts'
import {
  Users,
  UserCheck,
  Heart,
  Handshake,
  MessageCircle,
  TrendingUp,
  Percent,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'

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

const FUNNEL_COLORS = ['#2E5EA6', '#3B7DDD', '#5A9AE8', '#F5A623', '#22c55e']

// Simple Mercator projection for SVG map
const MAP_BOUNDS = { minLng: -76, maxLng: -52, minLat: -56, maxLat: -20 }
const MAP_W = 500
const MAP_H = 600

function project(lng: number, lat: number): [number, number] {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * MAP_W
  const latRad = (lat * Math.PI) / 180
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
  const minLatRad = (MAP_BOUNDS.minLat * Math.PI) / 180
  const maxLatRad = (MAP_BOUNDS.maxLat * Math.PI) / 180
  const minMercN = Math.log(Math.tan(Math.PI / 4 + minLatRad / 2))
  const maxMercN = Math.log(Math.tan(Math.PI / 4 + maxLatRad / 2))
  const y = MAP_H - ((mercN - minMercN) / (maxMercN - minMercN)) * MAP_H
  return [x, y]
}

// Simplified Argentina outline (approximate SVG path)
const ARGENTINA_PATH = `M 280 30 L 310 25 L 330 40 L 340 60 L 350 80 L 360 100
  L 370 120 L 375 140 L 380 160 L 385 180 L 380 200 L 370 220
  L 360 240 L 355 260 L 350 280 L 345 300 L 340 320 L 335 340
  L 330 360 L 320 380 L 310 400 L 300 420 L 280 440 L 260 460
  L 240 470 L 220 480 L 200 490 L 180 500 L 170 510 L 180 520
  L 200 530 L 220 540 L 240 545 L 260 540 L 270 530 L 260 520
  L 250 510 L 260 500 L 280 490 L 290 480 L 280 460 L 270 440
  L 260 420 L 250 400 L 240 380 L 235 360 L 230 340 L 225 320
  L 220 300 L 210 280 L 200 260 L 190 240 L 185 220 L 180 200
  L 175 180 L 180 160 L 190 140 L 200 120 L 210 100 L 220 80
  L 235 60 L 250 45 L 265 35 Z`

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

// --- City Map (pure SVG) ---
function CityMap({ cities }: { cities: KV[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const maxVal = Math.max(...cities.map((c) => c.value), 1)

  const mapped = cities
    .filter((c) => CITY_COORDS[c.name])
    .map((c) => {
      const [lng, lat] = CITY_COORDS[c.name]
      const [x, y] = project(lng, lat)
      return { name: c.name, value: c.value, x, y }
    })

  const unknown = cities.filter((c) => !CITY_COORDS[c.name])

  return (
    <Stack gap="3">
      <Box bg="white" border="1px solid" borderColor="surface.border" borderRadius="xl" overflow="hidden" p="4">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} width="100%" style={{ maxWidth: 500, display: 'block', margin: '0 auto' }}>
          {/* Background */}
          <rect width={MAP_W} height={MAP_H} fill="#F8FAFF" rx="8" />

          {/* Argentina silhouette */}
          <path d={ARGENTINA_PATH} fill="#E8F0FE" stroke="#C5D9F8" strokeWidth="1.5" />

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((pct) => (
            <line
              key={`h-${pct}`}
              x1="0" y1={MAP_H * pct} x2={MAP_W} y2={MAP_H * pct}
              stroke="#E0E0E0" strokeWidth="0.5" strokeDasharray="4 4"
            />
          ))}

          {/* City bubbles */}
          {mapped.map((city) => {
            const r = 8 + (city.value / maxVal) * 22
            const isHovered = hovered === city.name
            return (
              <g
                key={city.name}
                onMouseEnter={() => setHovered(city.name)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse ring */}
                <circle cx={city.x} cy={city.y} r={r} fill="none" stroke="#2E5EA6" strokeWidth={1} strokeOpacity={0.3}>
                  <animate attributeName="r" from={String(r)} to={String(r + 8)} dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2.5s" repeatCount="indefinite" />
                </circle>
                {/* Main bubble */}
                <circle
                  cx={city.x} cy={city.y} r={isHovered ? r + 2 : r}
                  fill="#2E5EA6" fillOpacity={isHovered ? 0.8 : 0.55}
                  stroke="#1B3B6F" strokeWidth={isHovered ? 2 : 1}
                  style={{ transition: 'all 0.2s' }}
                />
                {/* Count inside bubble */}
                <text
                  x={city.x} y={city.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: r > 16 ? 13 : 10, fontWeight: 700, fill: 'white', pointerEvents: 'none' }}
                >
                  {city.value}
                </text>
                {/* Label */}
                <text
                  x={city.x} y={city.y - r - 6}
                  textAnchor="middle"
                  style={{
                    fontSize: isHovered ? 12 : 10,
                    fontWeight: isHovered ? 700 : 500,
                    fill: '#1B3B6F',
                    transition: 'all 0.2s',
                    pointerEvents: 'none',
                  }}
                >
                  {city.name}
                </text>
              </g>
            )
          })}
        </svg>
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

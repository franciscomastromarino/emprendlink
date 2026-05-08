'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Button,
  Container,
  Field,
  Heading,
  Input,
  NativeSelect,
  Stack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { ROLES, INDUSTRIES, TEAM_SIZES } from '@/lib/constants'
import { ChipSelect } from '@/components/chip-select'
import { saveStep2 } from '../actions'
import { trackEvent } from '@/lib/analytics'
import { ProgressBar } from '../progress-bar'
import Link from 'next/link'

const normalizeUrl = (val: string) => {
  if (!val) return val
  if (!/^https?:\/\//i.test(val)) return `https://${val}`
  return val
}

const schema = z.object({
  role: z.enum(ROLES as unknown as [string, ...string[]], 'Elegí un rol'),
  startup: z.string().min(1, 'Requerido').max(80),
  startupUrl: z.string().transform(normalizeUrl).pipe(z.string().url('URL inválida')).optional().or(z.literal('')),
  teamSize: z.enum(TEAM_SIZES as unknown as [string, ...string[]], 'Elegí el tamaño'),
  industries: z
    .array(z.string())
    .min(1, 'Elegí al menos una')
    .max(3, 'Máximo 3'),
})

type FormData = z.infer<typeof schema>

export default function Step2Page() {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { industries: [] },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      trackEvent('onboarding_step_completed', { step: 2 })
      await saveStep2(data)
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <>
      <ProgressBar step={2} />
      <Container maxW="sm" py="6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="5">
            <Heading size="lg">Tu contexto profesional</Heading>

            <Box bg="surface.card" borderRadius="xl" p="5" borderWidth="1px" borderColor="surface.border">
              <Stack gap="4">
                <Field.Root invalid={!!errors.role}>
                  <Field.Label color="fg.muted" fontSize="sm">Rol</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field {...register('role')} bg="surface.input" borderColor="surface.border">
                      <option value="">Seleccionar...</option>
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  {errors.role && (
                    <Field.ErrorText>{errors.role.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.startup}>
                  <Field.Label color="fg.muted" fontSize="sm">Startup / Empresa</Field.Label>
                  <Input {...register('startup')} maxLength={80} bg="surface.input" borderColor="surface.border" />
                  {errors.startup && (
                    <Field.ErrorText>{errors.startup.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.startupUrl}>
                  <Field.Label color="fg.muted" fontSize="sm">Sitio web (opcional)</Field.Label>
                  <Input
                    {...register('startupUrl')}
                    placeholder="https://miempresa.com"
                    type="url"
                    bg="surface.input"
                    borderColor="surface.border"
                    _placeholder={{ color: 'fg.subtle' }}
                  />
                  {errors.startupUrl && (
                    <Field.ErrorText>{errors.startupUrl.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.teamSize}>
                  <Field.Label color="fg.muted" fontSize="sm">Tamaño del equipo</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field {...register('teamSize')} bg="surface.input" borderColor="surface.border">
                      <option value="">Seleccionar...</option>
                      {TEAM_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size} {size === 'Solo founder' ? '' : 'personas'}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  {errors.teamSize && (
                    <Field.ErrorText>{errors.teamSize.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.industries}>
                  <Field.Label color="fg.muted" fontSize="sm">Industria (máx. 3)</Field.Label>
                  <Controller
                    name="industries"
                    control={control}
                    render={({ field }) => (
                      <ChipSelect
                        options={INDUSTRIES}
                        value={field.value}
                        onChange={field.onChange}
                        max={3}
                        colorScheme="green"
                      />
                    )}
                  />
                  {errors.industries && (
                    <Field.ErrorText>{errors.industries.message}</Field.ErrorText>
                  )}
                </Field.Root>
              </Stack>
            </Box>

            <Stack direction="row" gap="3">
              <Button asChild variant="outline" flex="1">
                <Link href="/onboarding/step-1">Atrás</Link>
              </Button>
              <Button type="submit" flex="1" colorPalette="brand" loading={submitting}>
                Siguiente
              </Button>
            </Stack>
            <Button
              variant="ghost"
              size="sm"
              color="fg.subtle"
              onClick={() => signOut({ callbackUrl: '/' })}
              alignSelf="center"
            >
              Cerrar sesión
            </Button>
          </Stack>
        </form>
      </Container>
    </>
  )
}

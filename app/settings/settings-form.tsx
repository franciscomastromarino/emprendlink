'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import {
  Avatar,
  Box,
  Button,
  Container,
  Field,
  Heading,
  HStack,
  Input,
  NativeSelect,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { signOut } from 'next-auth/react'
import { ROLES, INDUSTRIES, INTENTS, INTERESTS, TEAM_SIZES } from '@/lib/constants'
import { ChipSelect } from '@/components/chip-select'
import { updateProfile, deleteAccount, uploadAvatar } from './actions'
import type { Profile } from '@prisma/client'
import Link from 'next/link'
import {
  Camera,
  LogOut,
  Trash2,
  User,
  Target,
  FileText,
  Eye,
  ChevronLeft,
} from 'lucide-react'

const normalizeUrl = (val: string) => {
  if (!val) return val
  if (!/^https?:\/\//i.test(val)) return `https://${val}`
  return val
}

const schema = z.object({
  fullName: z.string().min(2).max(80),
  whatsappE164: z.string().refine(isValidPhoneNumber, 'Número inválido'),
  avatarUrl: z.string().optional(),
  role: z.enum(ROLES as unknown as [string, ...string[]]),
  startup: z.string().min(1).max(80),
  startupUrl: z.string().transform(normalizeUrl).pipe(z.string().url('URL inválida')).optional().or(z.literal('')),
  teamSize: z.string().optional(),
  industries: z.array(z.string()).min(1).max(3),
  lookingFor: z.array(z.string()).min(1).max(2),
  interests: z.array(z.string()).min(1).max(3),
  bio: z.string().max(280).optional(),
  city: z.string().max(80).optional(),
  linkedinUrl: z.string().transform(normalizeUrl).pipe(z.string().url('URL inválida')).optional().or(z.literal('')),
  visible: z.boolean(),
})

type FormData = z.infer<typeof schema>

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ size: number; color: string }>; title: string }) {
  return (
    <HStack gap="2" mb="4">
      <Box
        w="8"
        h="8"
        borderRadius="lg"
        bg="#E8F0FE"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Icon size={16} color="#2E5EA6" />
      </Box>
      <Heading size="sm">{title}</Heading>
    </HStack>
  )
}

export function SettingsForm({ profile }: { profile: Profile }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [phone, setPhone] = useState(profile.whatsappE164)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl ?? '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      // Resize image client-side to keep payload small
      const bitmap = await createImageBitmap(file)
      const size = 256
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      // Crop to square from center
      const min = Math.min(bitmap.width, bitmap.height)
      const sx = (bitmap.width - min) / 2
      const sy = (bitmap.height - min) / 2
      ctx.drawImage(bitmap, sx, sy, min, min, 0, 0, size, size)
      const base64 = canvas.toDataURL('image/jpeg', 0.8)
      setAvatarPreview(base64)
      const { avatarUrl } = await uploadAvatar(base64)
      setAvatarPreview(avatarUrl)
      setValue('avatarUrl', avatarUrl)
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile.fullName,
      whatsappE164: profile.whatsappE164,
      avatarUrl: profile.avatarUrl ?? '',
      role: profile.role as FormData['role'],
      startup: profile.startup,
      startupUrl: profile.startupUrl ?? '',
      teamSize: profile.teamSize ?? '',
      industries: profile.industries,
      lookingFor: profile.lookingFor,
      interests: profile.interests,
      bio: profile.bio ?? '',
      city: profile.city ?? '',
      linkedinUrl: profile.linkedinUrl ?? '',
      visible: profile.visible,
    },
  })

  const bioLength = watch('bio')?.length || 0

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    setSaved(false)
    await updateProfile(data)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDelete = async () => {
    await deleteAccount()
  }

  return (
    <Container maxW="lg" py="6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="6">
          {/* Header */}
          <HStack justify="space-between" align="start">
            <Stack gap="0.5">
              <HStack gap="2">
                <Button asChild variant="ghost" size="sm" p="0" minW="auto" color="fg.muted">
                  <Link href="/feed"><ChevronLeft size={20} /></Link>
                </Button>
                <Heading size="xl">Mi perfil</Heading>
              </HStack>
              <Text fontSize="sm" color="fg.muted" pl="7">
                Gestioná tu perfil y preferencias
              </Text>
            </Stack>
            <Button asChild variant="ghost" size="sm" color="brand.500" fontWeight="500">
              <Link href={`/profile/${profile.id}`}>
                <Eye size={14} />
                Vista previa
              </Link>
            </Button>
          </HStack>

          {/* Avatar */}
          <Stack align="center" gap="2">
            <Box position="relative">
              <Box
                borderRadius="full"
                p="0.5"
                borderWidth="2px"
                borderColor="surface.border"
              >
                <Avatar.Root size="2xl">
                  <Avatar.Image src={avatarPreview || undefined} />
                  <Avatar.Fallback>{profile.fullName[0]}</Avatar.Fallback>
                </Avatar.Root>
              </Box>
              <Box
                position="absolute"
                bottom="0"
                right="0"
                w="8"
                h="8"
                borderRadius="full"
                bg="brand.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                borderWidth="2px"
                borderColor="white"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                aria-label="Cambiar foto de perfil"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
              >
                <Camera size={14} color="white" />
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleAvatarChange}
              />
            </Box>
            {uploadingAvatar && (
              <Text fontSize="xs" color="fg.muted">Subiendo...</Text>
            )}
          </Stack>

          {/* Section 1: Información básica */}
          <Box>
            <SectionHeader icon={User} title="Información básica" />
            <Stack gap="4">
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <Field.Root invalid={!!errors.fullName}>
                  <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">Nombre y apellido</Field.Label>
                  <Input {...register('fullName')} bg="white" borderColor="surface.border" fontSize="sm" />
                  {errors.fullName && <Field.ErrorText>{errors.fullName.message}</Field.ErrorText>}
                </Field.Root>

                <Field.Root invalid={!!errors.whatsappE164}>
                  <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">WhatsApp</Field.Label>
                  <PhoneInput
                    defaultCountry="AR"
                    value={phone}
                    onChange={(val) => {
                      setPhone(val || '')
                      setValue('whatsappE164', val || '', { shouldValidate: true })
                    }}
                    international
                    countryCallingCodeEditable={false}
                    className="phone-input"
                  />
                  {errors.whatsappE164 && <Field.ErrorText>{errors.whatsappE164.message}</Field.ErrorText>}
                </Field.Root>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <Field.Root invalid={!!errors.role}>
                  <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">Rol</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field {...register('role')} bg="white" borderColor="surface.border" fontSize="sm">
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>

                <Field.Root invalid={!!errors.startup}>
                  <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">Startup / Empresa</Field.Label>
                  <Input {...register('startup')} maxLength={80} bg="white" borderColor="surface.border" fontSize="sm" />
                </Field.Root>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <Field.Root invalid={!!errors.startupUrl}>
                  <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">Sitio web (opcional)</Field.Label>
                  <Input {...register('startupUrl')} placeholder="https://miempresa.com" type="url" bg="white" borderColor="surface.border" fontSize="sm" _placeholder={{ color: 'fg.subtle' }} />
                  {errors.startupUrl && <Field.ErrorText>{errors.startupUrl.message}</Field.ErrorText>}
                </Field.Root>

                <Field.Root>
                  <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">Tamaño del equipo</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field {...register('teamSize')} bg="white" borderColor="surface.border" fontSize="sm">
                      <option value="">Seleccionar...</option>
                      {TEAM_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size} {size === 'Solo founder' ? '' : 'personas'}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>
              </SimpleGrid>
            </Stack>
          </Box>

          {/* Divider */}
          <Box borderTopWidth="1px" borderColor="surface.border" />

          {/* Section 2: Contá quién sos y qué buscás */}
          <Box>
            <SectionHeader icon={Target} title="Contá quién sos y qué buscás" />
            <Stack gap="4">
              <Field.Root>
                <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">Industria (máx. 3)</Field.Label>
                <Controller
                  name="industries"
                  control={control}
                  render={({ field }) => (
                    <ChipSelect options={INDUSTRIES} value={field.value} onChange={field.onChange} max={3} colorScheme="green" />
                  )}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">¿Qué buscás? (máx. 2)</Field.Label>
                <Controller
                  name="lookingFor"
                  control={control}
                  render={({ field }) => (
                    <ChipSelect options={INTENTS} value={field.value} onChange={field.onChange} max={2} colorScheme="blue" />
                  )}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">Intereses (máx. 3)</Field.Label>
                <Controller
                  name="interests"
                  control={control}
                  render={({ field }) => (
                    <ChipSelect options={INTERESTS} value={field.value} onChange={field.onChange} max={3} colorScheme="orange" />
                  )}
                />
              </Field.Root>
            </Stack>
          </Box>

          {/* Divider */}
          <Box borderTopWidth="1px" borderColor="surface.border" />

          {/* Section 3: Sobre vos */}
          <Box>
            <SectionHeader icon={FileText} title="Sobre vos" />
            <Stack gap="4">
              <Field.Root>
                <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">Bio ({bioLength}/280)</Field.Label>
                <Textarea {...register('bio')} maxLength={280} rows={3} bg="white" borderColor="surface.border" fontSize="sm" />
              </Field.Root>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <Field.Root>
                  <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">Ciudad</Field.Label>
                  <Input {...register('city')} maxLength={80} bg="white" borderColor="surface.border" fontSize="sm" />
                </Field.Root>

                <Field.Root invalid={!!errors.linkedinUrl}>
                  <Field.Label color="fg.muted" fontSize="sm" fontWeight="500">LinkedIn URL (opcional)</Field.Label>
                  <Input {...register('linkedinUrl')} placeholder="https://linkedin.com/in/..." type="url" bg="white" borderColor="surface.border" fontSize="sm" _placeholder={{ color: 'fg.subtle' }} />
                  {errors.linkedinUrl && <Field.ErrorText>{errors.linkedinUrl.message}</Field.ErrorText>}
                </Field.Root>
              </SimpleGrid>

              <Field.Root>
                <HStack justify="space-between" align="center">
                  <Stack gap="0">
                    <Field.Label mb="0" fontSize="sm" fontWeight="500">Visible para otros miembros</Field.Label>
                    <Text fontSize="xs" color="fg.subtle">
                      Tu perfil podrá ser visto en Descubrir y tu comunidad
                    </Text>
                  </Stack>
                  <Controller
                    name="visible"
                    control={control}
                    render={({ field }) => (
                      <Switch.Root
                        checked={field.value}
                        onCheckedChange={({ checked }) => field.onChange(checked)}
                        colorPalette="brand"
                      >
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                    )}
                  />
                </HStack>
              </Field.Root>
            </Stack>
          </Box>

          {/* Divider */}
          <Box borderTopWidth="1px" borderColor="surface.border" />

          {/* Actions */}
          <Stack gap="3">
            <Button
              type="submit"
              size="lg"
              colorPalette="brand"
              borderRadius="full"
              loading={saving}
              fontWeight="600"
            >
              {saved ? 'Guardado' : 'Guardar cambios'}
            </Button>

            <Button
              variant="outline"
              borderRadius="full"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut size={16} />
              Cerrar sesión
            </Button>

            {!showDelete ? (
              <Button
                variant="ghost"
                colorPalette="red"
                size="sm"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 size={14} />
                Eliminar mi cuenta
              </Button>
            ) : (
              <Box p="4" borderWidth="1px" borderColor="red.300" borderRadius="xl" bg="red.50">
                <Text fontSize="sm" color="red.600" mb="3">
                  Esta acción es irreversible. Se eliminará tu cuenta y todos tus datos.
                </Text>
                <Stack direction="row" gap="2">
                  <Button
                    colorPalette="red"
                    size="sm"
                    flex="1"
                    borderRadius="full"
                    onClick={handleDelete}
                  >
                    Confirmar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    flex="1"
                    borderRadius="full"
                    onClick={() => setShowDelete(false)}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </Box>
            )}
          </Stack>
        </Stack>
      </form>
    </Container>
  )
}

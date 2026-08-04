import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { FiscalSettings } from '@/modules/fiscal/domain/entities/fiscal-settings.entity'
import type { FiscalEnvironment } from '@/enums/fiscal-environment.enum'
import { toIssueList } from '@/core/utils/zod-errors'

function toDate(value: string): Date {
  return new Date(value)
}

function toDateOrNull(value: string | null): Date | null {
  return value === null ? null : new Date(value)
}

const establishmentRefSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.string().optional(),
  })
  .nullable()
  .default(null)

const fiscalSettingsSchema = z.object({
  id: z.string(),
  establishmentId: z.string(),
  companyId: z.string(),
  ambiente: z.string(),
  serieNfce: z.number().default(1),
  proximoNumeroNfce: z.number().default(1),
  codigoCsc: z.string().nullable().default(null),
  idCsc: z.string().nullable().default(null),
  certificadoRef: z.string().nullable().default(null),
  certificadoSenhaRef: z.string().nullable().default(null),
  certificadoValidade: z.string().nullable().default(null),
  certificadoSubject: z.string().nullable().default(null),
  ativo: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
  establishment: establishmentRefSchema,
})

type FiscalSettingsPayload = z.infer<typeof fiscalSettingsSchema>

function build(value: FiscalSettingsPayload): FiscalSettings {
  return new FiscalSettings({
    id: value.id,
    establishmentId: value.establishmentId,
    companyId: value.companyId,
    ambiente: value.ambiente as FiscalEnvironment,
    serieNfce: value.serieNfce,
    proximoNumeroNfce: value.proximoNumeroNfce,
    codigoCsc: value.codigoCsc,
    idCsc: value.idCsc,
    certificadoRef: value.certificadoRef,
    certificadoSenhaRef: value.certificadoSenhaRef,
    certificadoValidade: toDateOrNull(value.certificadoValidade),
    certificadoSubject: value.certificadoSubject,
    ativo: value.ativo,
    createdAt: toDate(value.createdAt),
    updatedAt: toDate(value.updatedAt),
    establishment: value.establishment
      ? {
          id: value.establishment.id,
          name: value.establishment.name,
          type: value.establishment.type,
        }
      : null,
  })
}

export function toFiscalSettings(
  data: unknown,
): Either<DomainError, FiscalSettings> {
  const parsed = fiscalSettingsSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-settings', toIssueList(parsed.error)),
    )
  }

  return Either.right(build(parsed.data))
}

export function toFiscalSettingsList(
  data: unknown,
): Either<DomainError, FiscalSettings[]> {
  const parsed = z.array(fiscalSettingsSchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-settings', toIssueList(parsed.error)),
    )
  }

  return Either.right(parsed.data.map(build))
}

/** `GET /fiscal/settings/:establishmentId` devolve a config ou `null`. */
export function toFiscalSettingsOrNull(
  data: unknown,
): Either<DomainError, FiscalSettings | null> {
  if (data === null || data === undefined || data === '') {
    return Either.right(null)
  }
  return toFiscalSettings(data)
}

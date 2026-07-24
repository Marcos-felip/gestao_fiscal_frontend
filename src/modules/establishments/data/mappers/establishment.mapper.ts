import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import type { EstablishmentType } from '@/enums/establishment-type.enum'
import { toIssueList } from '@/core/utils/zod-errors'

const establishmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  cnpj: z.string().nullable().default(null),
  inscricaoEstadual: z.string().nullable().default(null),
  inscricaoMunicipal: z.string().nullable().default(null),
  cep: z.string().nullable().default(null),
  street: z.string().nullable().default(null),
  number: z.string().nullable().default(null),
  complement: z.string().nullable().default(null),
  neighborhood: z.string().nullable().default(null),
  city: z.string().nullable().default(null),
  state: z.string().nullable().default(null),
  createdAt: z.string().nullable().default(null),
})

type EstablishmentPayload = z.infer<typeof establishmentSchema>

function build(value: EstablishmentPayload): Establishment {
  return new Establishment(
    value.id,
    value.name,
    value.type as EstablishmentType,
    value.cnpj,
    value.inscricaoEstadual,
    value.inscricaoMunicipal,
    value.cep,
    value.street,
    value.number,
    value.complement,
    value.neighborhood,
    value.city,
    value.state,
    value.createdAt,
  )
}

export function toEstablishment(
  data: unknown,
): Either<DomainError, Establishment> {
  const parsed = establishmentSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('establishments', toIssueList(parsed.error)),
    )
  }

  return Either.right(build(parsed.data))
}

export function toEstablishmentList(
  data: unknown,
): Either<DomainError, Establishment[]> {
  const parsed = z.array(establishmentSchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('establishments', toIssueList(parsed.error)),
    )
  }

  return Either.right(parsed.data.map(build))
}

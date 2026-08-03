import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { CashRegister } from '@/modules/cash/domain/entities/cash-register.entity'
import { toIssueList } from '@/core/utils/zod-errors'

const establishmentRefSchema = z
  .object({ id: z.string(), name: z.string().nullable().default(null) })
  .nullable()
  .default(null)

const cashRegisterSchema = z.object({
  id: z.string(),
  establishmentId: z.string().nullable().default(null),
  establishment: establishmentRefSchema,
  name: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
})

type CashRegisterPayload = z.infer<typeof cashRegisterSchema>

function build(value: CashRegisterPayload): CashRegister {
  return new CashRegister({
    id: value.id,
    establishmentId: value.establishmentId,
    establishmentName: value.establishment?.name ?? null,
    name: value.name,
    isActive: value.isActive,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  })
}

export function toCashRegister(
  data: unknown,
): Either<DomainError, CashRegister> {
  const parsed = cashRegisterSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('cash-registers', toIssueList(parsed.error)),
    )
  }

  return Either.right(build(parsed.data))
}

/** `GET /cash-registers` devolve um array cru (não paginado). */
export function toCashRegisterList(
  data: unknown,
): Either<DomainError, CashRegister[]> {
  const parsed = z.array(cashRegisterSchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('cash-registers', toIssueList(parsed.error)),
    )
  }

  return Either.right(parsed.data.map(build))
}

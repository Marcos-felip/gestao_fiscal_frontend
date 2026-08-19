import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { toIssueList } from '@/core/utils/zod-errors'
import { FiscalCorrectionLetter } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'
import { FiscalInutilization } from '@/modules/fiscal/domain/entities/fiscal-inutilization.entity'
import type { FiscalPendingRange } from '@/modules/fiscal/domain/responses/fiscal-pending-range'
import { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'
import { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'

/**
 * Contrato dos eventos fiscais: carta de correção e inutilização.
 *
 * Os enums são validados com `z.nativeEnum` — modelo ou ambiente que o frontend
 * não conhece vira `ContractError`, e não um badge em branco na tela.
 */

const correctionLetterSchema = z.object({
  id: z.string(),
  fiscalDocumentId: z.string(),
  sequencia: z.number(),
  correcao: z.string(),
  condicaoDeUso: z.string().nullable().default(null),
  protocolo: z.string().nullable().default(null),
  xmlEvento: z.string().nullable().default(null),
  createdAt: z.string(),
})

function buildCorrectionLetter(
  value: z.infer<typeof correctionLetterSchema>,
): FiscalCorrectionLetter {
  return new FiscalCorrectionLetter({
    id: value.id,
    fiscalDocumentId: value.fiscalDocumentId,
    sequencia: value.sequencia,
    correcao: value.correcao,
    condicaoDeUso: value.condicaoDeUso,
    protocolo: value.protocolo,
    xmlEvento: value.xmlEvento,
    createdAt: new Date(value.createdAt),
  })
}

export function toFiscalCorrectionLetter(
  data: unknown,
): Either<DomainError, FiscalCorrectionLetter> {
  const parsed = correctionLetterSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-correction-letter', toIssueList(parsed.error)),
    )
  }

  return Either.right(buildCorrectionLetter(parsed.data))
}

/** A listagem vem como array cru, sem envelope de paginação. */
export function toFiscalCorrectionLetterList(
  data: unknown,
): Either<DomainError, FiscalCorrectionLetter[]> {
  const parsed = z.array(correctionLetterSchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-correction-letters', toIssueList(parsed.error)),
    )
  }

  return Either.right(parsed.data.map(buildCorrectionLetter))
}

const inutilizationSchema = z.object({
  id: z.string(),
  establishmentId: z.string(),
  modelo: z.nativeEnum(FiscalDocumentModel),
  ambiente: z.nativeEnum(FiscalEnvironment),
  serie: z.number(),
  numeroInicial: z.number(),
  numeroFinal: z.number(),
  ano: z.number(),
  justificativa: z.string(),
  protocolo: z.string().nullable().default(null),
  createdAt: z.string(),
})

export function toFiscalInutilization(
  data: unknown,
): Either<DomainError, FiscalInutilization> {
  const parsed = inutilizationSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-inutilization', toIssueList(parsed.error)),
    )
  }

  const value = parsed.data
  return Either.right(
    new FiscalInutilization({
      id: value.id,
      establishmentId: value.establishmentId,
      modelo: value.modelo,
      ambiente: value.ambiente,
      serie: value.serie,
      numeroInicial: value.numeroInicial,
      numeroFinal: value.numeroFinal,
      ano: value.ano,
      justificativa: value.justificativa,
      protocolo: value.protocolo,
      createdAt: new Date(value.createdAt),
    }),
  )
}

const pendingRangesSchema = z.array(
  z.object({
    modelo: z.nativeEnum(FiscalDocumentModel),
    serie: z.number(),
    faixas: z.array(z.object({ inicio: z.number(), fim: z.number() })),
  }),
)

export function toFiscalPendingRanges(
  data: unknown,
): Either<DomainError, FiscalPendingRange[]> {
  const parsed = pendingRangesSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-pending-ranges', toIssueList(parsed.error)),
    )
  }

  return Either.right(parsed.data)
}

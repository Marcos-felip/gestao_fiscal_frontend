import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { FiscalSettingsEvent } from '@/modules/fiscal/domain/entities/fiscal-settings-event.entity'
import type {
  ProductionChecklist,
  ProductionChecklistItem,
  ConsultaPublicaResult,
} from '@/modules/fiscal/domain/responses/production-checklist'
import { toIssueList } from '@/core/utils/zod-errors'

function toDate(value: string): Date {
  return new Date(value)
}

function nullify(value: string | null | undefined): string | null {
  return value === undefined ? null : value
}

// --- Production checklist ---

const checklistItemSchema = z.object({
  item: z.string(),
  ok: z.boolean(),
  detalhe: z.string().optional(),
  bloqueante: z.boolean().optional(),
})

const productionChecklistSchema = z.object({
  liberada: z.boolean(),
  liberadaEm: z.string().nullable().default(null),
  itens: z.array(checklistItemSchema),
})

export function toProductionChecklist(
  data: unknown,
): Either<DomainError, ProductionChecklist> {
  const parsed = productionChecklistSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('production-checklist', toIssueList(parsed.error)),
    )
  }

  const v = parsed.data
  return Either.right({
    liberada: v.liberada,
    liberadaEm: v.liberadaEm,
    itens: v.itens.map(
      (i): ProductionChecklistItem => ({
        item: i.item,
        ok: i.ok,
        detalhe: i.detalhe,
        bloqueante: i.bloqueante,
      }),
    ),
  })
}

// --- Consulta pública ---

const consultaPublicaResultSchema = z.object({
  validada: z.boolean(),
  chaveAcesso: z.string(),
  situacao: z.string(),
})

export function toConsultaPublicaResult(
  data: unknown,
): Either<DomainError, ConsultaPublicaResult> {
  const parsed = consultaPublicaResultSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('consulta-publica', toIssueList(parsed.error)),
    )
  }

  const v = parsed.data
  return Either.right({
    validada: v.validada,
    chaveAcesso: v.chaveAcesso,
    situacao: v.situacao,
  })
}

// --- Settings history ---

const settingsEventSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  fiscalSettingsId: z.string(),
  tipo: z.string(),
  valorAnterior: z.string().nullable().default(null),
  valorNovo: z.string().nullable().default(null),
  usuarioId: z.string().nullable().default(null),
  createdAt: z.string(),
})

export function toFiscalSettingsEventList(
  data: unknown,
): Either<DomainError, FiscalSettingsEvent[]> {
  const parsed = z.array(settingsEventSchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-settings-history', toIssueList(parsed.error)),
    )
  }

  return Either.right(
    parsed.data.map(
      (v) =>
        new FiscalSettingsEvent({
          id: v.id,
          companyId: v.companyId,
          fiscalSettingsId: v.fiscalSettingsId,
          tipo: v.tipo,
          valorAnterior: nullify(v.valorAnterior),
          valorNovo: nullify(v.valorNovo),
          usuarioId: nullify(v.usuarioId),
          createdAt: toDate(v.createdAt),
        }),
    ),
  )
}

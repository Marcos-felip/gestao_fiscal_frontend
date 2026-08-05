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
import type {
  FiscalRejectionItem,
  FiscalRejectionListResponse,
  FiscalRejectionUltimaTentativa,
} from '@/modules/fiscal/domain/responses/fiscal-rejection-item'
import { FiscalDocument } from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import type { FiscalSnapshot } from '@/modules/fiscal/domain/value-objects/fiscal-snapshot'
import type { FiscalDocumentModel } from '@/enums/fiscal-document-model.enum'
import type { FiscalEnvironment } from '@/enums/fiscal-environment.enum'
import type { FiscalDocumentStatus } from '@/enums/fiscal-document-status.enum'
import { toIssueList } from '@/core/utils/zod-errors'

function toDate(value: string): Date {
  return new Date(value)
}

function toDateOrNull(value: string | null | undefined): Date | null {
  return value === null || value === undefined ? null : new Date(value)
}

function nullify(value: string | null | undefined): string | null {
  return value === undefined ? null : value
}

function toNumberOrNull(value: number | string | null): number | null {
  if (value === null) return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const nullableDecimal = z
  .union([z.number(), z.string()])
  .nullable()
  .default(null)

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

// --- Rejections ---

const rejectionEstablishmentRefSchema = z
  .object({ id: z.string(), name: z.string() })
  .nullable()
  .default(null)

const rejectionSaleRefSchema = z
  .object({
    id: z.string(),
    saleNumber: z.union([z.string(), z.number()]),
    totalAmount: nullableDecimal,
  })
  .nullable()
  .default(null)

const rejectionDocumentSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  establishmentId: z.string(),
  saleId: z.string().nullable().default(null),
  modelo: z.string(),
  serie: z.number().default(0),
  numero: z.number().default(0),
  chaveAcesso: z.string().nullable().default(null),
  ambiente: z.string(),
  status: z.string(),
  protocolo: z.string().nullable().default(null),
  rejeicaoCodigo: z.string().nullable().default(null),
  rejeicaoMensagem: z.string().nullable().default(null),
  dataEmissao: z.string().nullable().default(null),
  dataAutorizacao: z.string().nullable().default(null),
  dataCancelamento: z.string().nullable().default(null),
  valorTotal: nullableDecimal,
  xmlEnviado: z.string().nullable().default(null),
  xmlAutorizado: z.string().nullable().default(null),
  xmlCancelamento: z.string().nullable().default(null),
  danfeUrl: z.string().nullable().default(null),
  qrCode: z.string().nullable().default(null),
  idempotencyKey: z.string().nullable().default(null),
  attempts: z.number().default(0),
  engine: z.string().nullable().default(null),
  snapshot: z.unknown().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
  establishment: rejectionEstablishmentRefSchema,
  sale: rejectionSaleRefSchema,
  statusHistory: z.array(z.unknown()).default([]),
  events: z.array(z.unknown()).default([]),
})

const ultimaTentativaSchema = z
  .object({
    data: z.string(),
    usuarioId: z.string().nullable().default(null),
    motivo: z.string().nullable().default(null),
  })
  .nullable()
  .default(null)

const rejectionItemSchema = z.object({
  document: rejectionDocumentSchema,
  reprocessavel: z.boolean(),
  ultimaTentativa: ultimaTentativaSchema,
})

const rejectionListSchema = z.object({
  data: z.array(rejectionItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

function buildRejectionDocument(
  v: z.infer<typeof rejectionDocumentSchema>,
): FiscalDocument {
  return new FiscalDocument({
    id: v.id,
    companyId: v.companyId,
    establishmentId: v.establishmentId,
    saleId: v.saleId,
    modelo: v.modelo as FiscalDocumentModel,
    serie: v.serie,
    numero: v.numero,
    chaveAcesso: v.chaveAcesso,
    ambiente: v.ambiente as FiscalEnvironment,
    status: v.status as FiscalDocumentStatus,
    protocolo: v.protocolo,
    rejeicaoCodigo: v.rejeicaoCodigo,
    rejeicaoMensagem: v.rejeicaoMensagem,
    dataEmissao: toDateOrNull(v.dataEmissao),
    dataAutorizacao: toDateOrNull(v.dataAutorizacao),
    dataCancelamento: toDateOrNull(v.dataCancelamento),
    valorTotal: toNumberOrNull(v.valorTotal),
    xmlEnviado: v.xmlEnviado,
    xmlAutorizado: v.xmlAutorizado,
    xmlCancelamento: v.xmlCancelamento,
    danfeUrl: v.danfeUrl,
    qrCode: v.qrCode,
    idempotencyKey: v.idempotencyKey,
    attempts: v.attempts,
    engine: v.engine,
    snapshot: (v.snapshot as FiscalSnapshot | null) ?? null,
    createdAt: toDate(v.createdAt),
    updatedAt: toDate(v.updatedAt),
    establishment: v.establishment
      ? { id: v.establishment.id, name: v.establishment.name }
      : null,
    sale: v.sale
      ? {
          id: v.sale.id,
          saleNumber: v.sale.saleNumber,
          totalAmount: toNumberOrNull(v.sale.totalAmount),
        }
      : null,
    statusHistory: [],
    events: [],
  })
}

function buildUltimaTentativa(
  v: z.infer<typeof ultimaTentativaSchema>,
): FiscalRejectionUltimaTentativa | null {
  if (!v) return null
  return {
    data: v.data,
    usuarioId: v.usuarioId,
    motivo: v.motivo,
  }
}

export function toFiscalRejectionList(
  data: unknown,
): Either<DomainError, FiscalRejectionListResponse> {
  const parsed = rejectionListSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-rejections', toIssueList(parsed.error)),
    )
  }

  const v = parsed.data
  const totalPages = v.limit > 0 ? Math.ceil(v.total / v.limit) : 0
  return Either.right({
    items: v.data.map(
      (item): FiscalRejectionItem => ({
        document: buildRejectionDocument(item.document),
        reprocessavel: item.reprocessavel,
        ultimaTentativa: buildUltimaTentativa(item.ultimaTentativa),
      }),
    ),
    total: v.total,
    page: v.page,
    limit: v.limit,
    totalPages,
    hasNext: v.page < totalPages,
  })
}

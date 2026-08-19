import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { CertificateStatus } from '@/modules/fiscal/domain/entities/certificate-status.entity'
import { FiscalCertificateEvent } from '@/modules/fiscal/domain/entities/fiscal-certificate-event.entity'
import type { StatusServicoResult } from '@/modules/fiscal/domain/responses/status-servico-result'
import type { FiscalEngineHealth } from '@/modules/fiscal/domain/responses/fiscal-engine-health'
import { toIssueList } from '@/core/utils/zod-errors'

function toDateOrNull(value: string | null | undefined): Date | null {
  return value === null || value === undefined ? null : new Date(value)
}

function nullify(value: string | null | undefined): string | null {
  return value === undefined ? null : value
}

function numberOrNull(value: number | null | undefined): number | null {
  return value === undefined ? null : value
}

// --- Situação do certificado ---

const certificateStatusSchema = z.object({
  configurado: z.boolean(),
  titular: z.string().nullish(),
  subject: z.string().nullish(),
  validoAte: z.string().nullish(),
  diasParaVencer: z.number().nullish(),
  vencido: z.boolean().default(false),
})

export function toCertificateStatus(
  data: unknown,
): Either<DomainError, CertificateStatus> {
  const parsed = certificateStatusSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-certificate', toIssueList(parsed.error)),
    )
  }

  const v = parsed.data
  return Either.right(
    new CertificateStatus({
      configurado: v.configurado,
      titular: nullify(v.titular),
      subject: nullify(v.subject),
      validoAte: toDateOrNull(v.validoAte),
      diasParaVencer: numberOrNull(v.diasParaVencer),
      vencido: v.vencido,
    }),
  )
}

// --- Histórico do certificado ---

const certificateEventSchema = z.object({
  tipo: z.string(),
  subject: z.string().nullish(),
  titular: z.string().nullish(),
  validoAte: z.string().nullish(),
  subjectAnterior: z.string().nullish(),
  usuarioId: z.string().nullish(),
  createdAt: z.string(),
})

export function toFiscalCertificateEventList(
  data: unknown,
): Either<DomainError, FiscalCertificateEvent[]> {
  const parsed = z.array(certificateEventSchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError(
        'fiscal-certificate-history',
        toIssueList(parsed.error),
      ),
    )
  }

  return Either.right(
    parsed.data.map(
      (v) =>
        new FiscalCertificateEvent({
          tipo: v.tipo,
          subject: nullify(v.subject),
          titular: nullify(v.titular),
          validoAte: toDateOrNull(v.validoAte),
          subjectAnterior: nullify(v.subjectAnterior),
          usuarioId: nullify(v.usuarioId),
          createdAt: new Date(v.createdAt),
        }),
    ),
  )
}

// --- Teste SEFAZ (status do serviço) ---

const statusServicoSchema = z.object({
  disponivel: z.boolean(),
  mensagem: z.string().nullish(),
  tempoMedioResposta: z.number().nullish(),
})

export function toStatusServicoResult(
  data: unknown,
): Either<DomainError, StatusServicoResult> {
  const parsed = statusServicoSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-sefaz-status', toIssueList(parsed.error)),
    )
  }

  const v = parsed.data
  return Either.right({
    disponivel: v.disponivel,
    mensagem: nullify(v.mensagem),
    tempoMedioResposta: numberOrNull(v.tempoMedioResposta),
  })
}

// --- Saúde do motor fiscal ---

const engineHealthSchema = z.object({
  disponivel: z.boolean(),
  status: z.string().nullish(),
  mensagem: z.string().nullish(),
  latenciaMs: z.number().default(0),
})

export function toFiscalEngineHealth(
  data: unknown,
): Either<DomainError, FiscalEngineHealth> {
  const parsed = engineHealthSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-engine-health', toIssueList(parsed.error)),
    )
  }

  const v = parsed.data
  return Either.right({
    disponivel: v.disponivel,
    status: nullify(v.status),
    mensagem: nullify(v.mensagem),
    latenciaMs: v.latenciaMs,
  })
}

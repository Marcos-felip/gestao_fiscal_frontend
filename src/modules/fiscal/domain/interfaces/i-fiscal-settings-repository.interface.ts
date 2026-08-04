import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalSettings } from '@/modules/fiscal/domain/entities/fiscal-settings.entity'
import type { CertificateStatus } from '@/modules/fiscal/domain/entities/certificate-status.entity'
import type { FiscalCertificateEvent } from '@/modules/fiscal/domain/entities/fiscal-certificate-event.entity'
import type { StatusServicoResult } from '@/modules/fiscal/domain/responses/status-servico-result'
import type { FiscalEngineHealth } from '@/modules/fiscal/domain/responses/fiscal-engine-health'
import type { CreateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/create-fiscal-settings-dto'
import type { UpdateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/update-fiscal-settings-dto'

export interface IFiscalSettingsRepository {
  list(): Promise<Either<DomainError, FiscalSettings[]>>
  /** Configuração de um estabelecimento, ou `null` se ainda não configurado. */
  getByEstablishment(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalSettings | null>>
  create(
    dto: CreateFiscalSettingsDto,
  ): Promise<Either<DomainError, FiscalSettings>>
  update(
    establishmentId: string,
    dto: UpdateFiscalSettingsDto,
  ): Promise<Either<DomainError, FiscalSettings>>

  // --- Certificado A1 ---
  /** Envia o certificado A1 (.pfx/.p12) + senha via multipart/form-data. */
  uploadCertificate(
    establishmentId: string,
    file: File,
    senha: string,
  ): Promise<Either<DomainError, CertificateStatus>>
  /** Situação atual do certificado do estabelecimento. */
  getCertificate(
    establishmentId: string,
  ): Promise<Either<DomainError, CertificateStatus>>
  /** Histórico de trocas/substituições do certificado. */
  getCertificateHistory(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalCertificateEvent[]>>

  // --- Diagnóstico ---
  /** Testa a comunicação com a SEFAZ usando o certificado/UF do estabelecimento. */
  testSefaz(
    establishmentId: string,
  ): Promise<Either<DomainError, StatusServicoResult>>
  /** Saúde do motor fiscal (serviço de emissão). */
  getEngineHealth(): Promise<Either<DomainError, FiscalEngineHealth>>
}

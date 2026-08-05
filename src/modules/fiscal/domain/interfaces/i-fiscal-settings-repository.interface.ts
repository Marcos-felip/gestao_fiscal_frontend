import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalSettings } from '@/modules/fiscal/domain/entities/fiscal-settings.entity'
import type { CertificateStatus } from '@/modules/fiscal/domain/entities/certificate-status.entity'
import type { FiscalCertificateEvent } from '@/modules/fiscal/domain/entities/fiscal-certificate-event.entity'
import type { FiscalSettingsEvent } from '@/modules/fiscal/domain/entities/fiscal-settings-event.entity'
import type { StatusServicoResult } from '@/modules/fiscal/domain/responses/status-servico-result'
import type { FiscalEngineHealth } from '@/modules/fiscal/domain/responses/fiscal-engine-health'
import type {
  ProductionChecklist,
  ConsultaPublicaResult,
} from '@/modules/fiscal/domain/responses/production-checklist'
import type { FiscalEnvironment } from '@/enums/fiscal-environment.enum'
import type { CreateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/create-fiscal-settings-dto'
import type { UpdateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/update-fiscal-settings-dto'

export interface IFiscalSettingsRepository {
  list(): Promise<Either<DomainError, FiscalSettings[]>>
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
  uploadCertificate(
    establishmentId: string,
    file: File,
    senha: string,
  ): Promise<Either<DomainError, CertificateStatus>>
  getCertificate(
    establishmentId: string,
  ): Promise<Either<DomainError, CertificateStatus>>
  getCertificateHistory(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalCertificateEvent[]>>

  // --- Diagnóstico ---
  testSefaz(
    establishmentId: string,
  ): Promise<Either<DomainError, StatusServicoResult>>
  getEngineHealth(): Promise<Either<DomainError, FiscalEngineHealth>>

  // --- Ambientes ---
  listByEnvironment(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalSettings[]>>
  activateEnvironment(
    establishmentId: string,
    ambiente: FiscalEnvironment,
  ): Promise<Either<DomainError, FiscalSettings>>

  // --- Produção ---
  getProductionChecklist(
    establishmentId: string,
  ): Promise<Either<DomainError, ProductionChecklist>>
  releaseProduction(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalSettings>>
  revokeProduction(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalSettings>>
  validatePublicConsultation(
    establishmentId: string,
  ): Promise<Either<DomainError, ConsultaPublicaResult>>

  // --- Histórico ---
  getSettingsHistory(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalSettingsEvent[]>>
}

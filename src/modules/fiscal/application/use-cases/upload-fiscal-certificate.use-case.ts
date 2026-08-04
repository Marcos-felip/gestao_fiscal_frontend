import type { IFiscalSettingsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-settings-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { CertificateStatus } from '@/modules/fiscal/domain/entities/certificate-status.entity'

export class UploadFiscalCertificate {
  private readonly repository: IFiscalSettingsRepository

  constructor(repository: IFiscalSettingsRepository) {
    this.repository = repository
  }

  async execute(
    establishmentId: string,
    file: File,
    senha: string,
  ): Promise<Either<DomainError, CertificateStatus>> {
    return this.repository.uploadCertificate(establishmentId, file, senha)
  }
}

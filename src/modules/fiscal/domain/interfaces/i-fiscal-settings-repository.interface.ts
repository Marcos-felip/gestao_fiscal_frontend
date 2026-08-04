import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalSettings } from '@/modules/fiscal/domain/entities/fiscal-settings.entity'
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
}

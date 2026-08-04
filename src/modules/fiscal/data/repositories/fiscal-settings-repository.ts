import type { IFiscalSettingsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-settings-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalSettings } from '@/modules/fiscal/domain/entities/fiscal-settings.entity'
import type { CreateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/create-fiscal-settings-dto'
import type { UpdateFiscalSettingsDto } from '@/modules/fiscal/domain/dto/update-fiscal-settings-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toFiscalSettings,
  toFiscalSettingsList,
  toFiscalSettingsOrNull,
} from '@/modules/fiscal/data/mappers/fiscal-settings.mapper'

export class FiscalSettingsRepository implements IFiscalSettingsRepository {
  async list(): Promise<Either<DomainError, FiscalSettings[]>> {
    const result = await httpClient.get<unknown>('/fiscal/settings')
    return result.flatMap(toFiscalSettingsList)
  }

  async getByEstablishment(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalSettings | null>> {
    const result = await httpClient.get<unknown>(
      `/fiscal/settings/${establishmentId}`,
    )
    return result.flatMap(toFiscalSettingsOrNull)
  }

  async create(
    dto: CreateFiscalSettingsDto,
  ): Promise<Either<DomainError, FiscalSettings>> {
    const payload: Record<string, unknown> = {
      establishmentId: dto.establishmentId,
    }
    if (dto.ambiente !== undefined) payload.ambiente = dto.ambiente
    if (dto.serieNfce !== undefined) payload.serieNfce = dto.serieNfce
    if (dto.codigoCsc !== undefined) payload.codigoCsc = dto.codigoCsc
    if (dto.idCsc !== undefined) payload.idCsc = dto.idCsc
    if (dto.certificadoRef !== undefined)
      payload.certificadoRef = dto.certificadoRef
    if (dto.certificadoSenhaRef !== undefined)
      payload.certificadoSenhaRef = dto.certificadoSenhaRef
    if (dto.ativo !== undefined) payload.ativo = dto.ativo

    const result = await httpClient.post<unknown>('/fiscal/settings', payload)
    return result.flatMap(toFiscalSettings)
  }

  async update(
    establishmentId: string,
    dto: UpdateFiscalSettingsDto,
  ): Promise<Either<DomainError, FiscalSettings>> {
    const payload: Record<string, unknown> = {}
    if (dto.ambiente !== undefined) payload.ambiente = dto.ambiente
    if (dto.serieNfce !== undefined) payload.serieNfce = dto.serieNfce
    if (dto.proximoNumeroNfce !== undefined)
      payload.proximoNumeroNfce = dto.proximoNumeroNfce
    if (dto.codigoCsc !== undefined) payload.codigoCsc = dto.codigoCsc
    if (dto.idCsc !== undefined) payload.idCsc = dto.idCsc
    if (dto.certificadoRef !== undefined)
      payload.certificadoRef = dto.certificadoRef
    if (dto.certificadoSenhaRef !== undefined)
      payload.certificadoSenhaRef = dto.certificadoSenhaRef
    if (dto.certificadoValidade !== undefined)
      payload.certificadoValidade = dto.certificadoValidade
    if (dto.certificadoSubject !== undefined)
      payload.certificadoSubject = dto.certificadoSubject
    if (dto.ativo !== undefined) payload.ativo = dto.ativo

    const result = await httpClient.patch<unknown>(
      `/fiscal/settings/${establishmentId}`,
      payload,
    )
    return result.flatMap(toFiscalSettings)
  }
}

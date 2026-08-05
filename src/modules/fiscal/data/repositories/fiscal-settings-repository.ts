import type { IFiscalSettingsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-settings-repository.interface'
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
import { httpClient } from '@/core/client/http-client'
import {
  toFiscalSettings,
  toFiscalSettingsList,
  toFiscalSettingsOrNull,
} from '@/modules/fiscal/data/mappers/fiscal-settings.mapper'
import {
  toCertificateStatus,
  toFiscalCertificateEventList,
  toStatusServicoResult,
  toFiscalEngineHealth,
} from '@/modules/fiscal/data/mappers/fiscal-certificate.mapper'
import {
  toProductionChecklist,
  toConsultaPublicaResult,
  toFiscalSettingsEventList,
} from '@/modules/fiscal/data/mappers/fiscal-production.mapper'

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

  async uploadCertificate(
    establishmentId: string,
    file: File,
    senha: string,
  ): Promise<Either<DomainError, CertificateStatus>> {
    const formData = new FormData()
    formData.append('certificado', file)
    formData.append('senha', senha)

    const result = await httpClient.post<unknown>(
      `/fiscal/settings/${establishmentId}/certificate`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return result.flatMap(toCertificateStatus)
  }

  async getCertificate(
    establishmentId: string,
  ): Promise<Either<DomainError, CertificateStatus>> {
    const result = await httpClient.get<unknown>(
      `/fiscal/settings/${establishmentId}/certificate`,
    )
    return result.flatMap(toCertificateStatus)
  }

  async getCertificateHistory(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalCertificateEvent[]>> {
    const result = await httpClient.get<unknown>(
      `/fiscal/settings/${establishmentId}/certificate/history`,
    )
    return result.flatMap(toFiscalCertificateEventList)
  }

  async testSefaz(
    establishmentId: string,
  ): Promise<Either<DomainError, StatusServicoResult>> {
    const result = await httpClient.post<unknown>(
      `/fiscal/settings/${establishmentId}/sefaz-status`,
    )
    return result.flatMap(toStatusServicoResult)
  }

  async getEngineHealth(): Promise<Either<DomainError, FiscalEngineHealth>> {
    const result = await httpClient.get<unknown>('/fiscal/engine/health')
    return result.flatMap(toFiscalEngineHealth)
  }

  async listByEnvironment(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalSettings[]>> {
    const result = await httpClient.get<unknown>(
      `/fiscal/settings/${establishmentId}/ambientes`,
    )
    return result.flatMap(toFiscalSettingsList)
  }

  async activateEnvironment(
    establishmentId: string,
    ambiente: FiscalEnvironment,
  ): Promise<Either<DomainError, FiscalSettings>> {
    const result = await httpClient.post<unknown>(
      `/fiscal/settings/${establishmentId}/ambientes/${ambiente}/ativar`,
    )
    return result.flatMap(toFiscalSettings)
  }

  async getProductionChecklist(
    establishmentId: string,
  ): Promise<Either<DomainError, ProductionChecklist>> {
    const result = await httpClient.get<unknown>(
      `/fiscal/settings/${establishmentId}/producao/checklist`,
    )
    return result.flatMap(toProductionChecklist)
  }

  async releaseProduction(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalSettings>> {
    const result = await httpClient.post<unknown>(
      `/fiscal/settings/${establishmentId}/producao/liberar`,
    )
    return result.flatMap(toFiscalSettings)
  }

  async revokeProduction(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalSettings>> {
    const result = await httpClient.post<unknown>(
      `/fiscal/settings/${establishmentId}/producao/revogar`,
    )
    return result.flatMap(toFiscalSettings)
  }

  async validatePublicConsultation(
    establishmentId: string,
  ): Promise<Either<DomainError, ConsultaPublicaResult>> {
    const result = await httpClient.post<unknown>(
      `/fiscal/settings/${establishmentId}/producao/validar-consulta`,
    )
    return result.flatMap(toConsultaPublicaResult)
  }

  async getSettingsHistory(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalSettingsEvent[]>> {
    const result = await httpClient.get<unknown>(
      `/fiscal/settings/${establishmentId}/history`,
    )
    return result.flatMap(toFiscalSettingsEventList)
  }
}

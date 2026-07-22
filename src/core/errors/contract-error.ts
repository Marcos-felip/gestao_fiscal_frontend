import { DomainError } from '@/core/errors/domain-error'

/**
 * A resposta chegou com sucesso, mas não bate com o schema Zod esperado.
 *
 * Isso NÃO é erro do usuário — é o contrato entre front e back quebrado
 * (campo renomeado, tipo alterado, deploy dessincronizado). Deve ir para
 * telemetria e a UI deve exibir uma mensagem genérica.
 */
export class ContractError extends DomainError {
  readonly isUserFacing = false
  readonly resource: string
  readonly issues: readonly string[]

  constructor(resource: string, issues: readonly string[] = []) {
    super(`Resposta inválida do servidor ao processar "${resource}".`)
    this.resource = resource
    this.issues = issues
  }
}

import { DomainError } from '@/core/errors/domain-error'

/** HTTP 5xx — falha do lado do servidor. Não é culpa do usuário. */
export class ServerError extends DomainError {
  readonly isUserFacing = false
  readonly statusCode: number

  constructor(statusCode: number, message = 'Erro interno do servidor.') {
    super(message)
    this.statusCode = statusCode
  }
}

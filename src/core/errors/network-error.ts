import { DomainError } from '@/core/errors/domain-error'

/** A requisição não obteve resposta (offline, timeout, DNS, CORS). */
export class NetworkError extends DomainError {
  readonly isUserFacing = true

  constructor(message = 'Não foi possível conectar ao servidor.') {
    super(message)
  }
}

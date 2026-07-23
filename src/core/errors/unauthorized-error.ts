import { DomainError } from '@/core/errors/domain-error'

/** HTTP 401 — credenciais ausentes, inválidas ou sessão expirada. */
export class UnauthorizedError extends DomainError {
  readonly isUserFacing = true

  constructor(message = 'Sessão expirada. Faça login novamente.') {
    super(message)
  }
}

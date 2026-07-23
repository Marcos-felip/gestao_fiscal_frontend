import { DomainError } from '@/core/errors/domain-error'

/** HTTP 400/422 — o backend recusou os dados enviados. */
export class ValidationError extends DomainError {
  readonly isUserFacing = true
  readonly details: readonly string[]

  constructor(message = 'Dados inválidos.', details: readonly string[] = []) {
    super(message)
    this.details = details
  }
}

/**
 * Raiz de todos os erros que trafegam no `Either` da aplicação.
 *
 * Existir um tipo base permite que a camada de apresentação decida o que fazer
 * com o erro (`instanceof`) em vez de inspecionar a string da mensagem.
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
    Object.setPrototypeOf(this, new.target.prototype)
  }

  /**
   * `true` quando o erro foi causado pelo usuário e a mensagem pode ser exibida
   * como está. `false` quando é falha nossa ou de infraestrutura — nesse caso a
   * UI deve mostrar um texto genérico e o erro merece telemetria.
   */
  abstract readonly isUserFacing: boolean
}

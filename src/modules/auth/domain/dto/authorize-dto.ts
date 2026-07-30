/**
 * Autorização de supervisor (step-up): valida as credenciais de um
 * administrador/proprietário para liberar uma ação que o operador logado não
 * tem permissão de executar (ex.: cancelar venda). NÃO troca a sessão atual.
 */
export class AuthorizeDto {
  email: string
  password: string
  /** Permissão exigida para a ação (ex.: 'sales.cancel'). */
  permission?: string

  constructor(fields: {
    email: string
    password: string
    permission?: string
  }) {
    this.email = fields.email
    this.password = fields.password
    this.permission = fields.permission
  }
}

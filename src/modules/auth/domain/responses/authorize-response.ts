export interface AuthorizeResult {
  /** Verdadeiro quando as credenciais são válidas e têm a permissão exigida. */
  authorized: boolean
  /** Nome do supervisor que autorizou (para registrar quem liberou a ação). */
  name: string
  /** Papel do supervisor (OWNER/ADMIN/...), quando retornado. */
  role: string | null
}

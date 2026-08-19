/**
 * Saúde do motor fiscal (serviço de emissão). Retornado por
 * `GET /fiscal/engine/health`.
 */
export interface FiscalEngineHealth {
  disponivel: boolean
  status: string | null
  mensagem: string | null
  latenciaMs: number
}

/**
 * Produto que ainda não pode sair numa nota, e o motivo.
 *
 * Não é `Product`: o backend devolve aqui só o recorte fiscal, e forçar a
 * entidade inteira obrigaria a inventar preço, estoque e unidade que a resposta
 * não traz.
 */
export interface ProductFiscalPending {
  id: string
  name: string
  sku: string | null
  ncm: string | null
  cfop: string | null
  origin: number | null
  csosn: string | null
  cstIcms: string | null
  /** O que falta, em português, uma frase por pendência. */
  pendencias: string[]
}

export interface ProductFiscalPendingList {
  items: ProductFiscalPending[]
  total: number
  page: number
  limit: number
}

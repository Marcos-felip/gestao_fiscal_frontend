/**
 * Retrato imutável dos dados usados na emissão fiscal. Pode chegar de duas
 * formas: rico (montado automaticamente a partir da venda) ou enxuto (emissão
 * manual). Todos os campos são opcionais e os valores monetários DENTRO do
 * snapshot já são números (não vêm como decimal-string).
 */
export interface FiscalSnapshotAddress {
  street?: string
  number?: string
  complement?: string
  district?: string
  city?: string
  state?: string
  zipCode?: string
  ibgeCode?: string
}

export interface FiscalSnapshotSale {
  id: string
  saleNumber?: string | number
  totalAmount?: number
  subtotal?: number
  discount?: number
  saleDate?: string
}

export interface FiscalSnapshotEstablishment {
  id: string
  name: string
  cnpj?: string
  inscricaoEstadual?: string
  ibgeCode?: string
  address?: FiscalSnapshotAddress
}

export interface FiscalSnapshotCustomer {
  id: string
  name: string
  cpfCnpj: string
}

export interface FiscalSnapshotItem {
  productId: string
  name: string
  ncm?: string
  ncm_code?: string
  cest?: string
  cfop?: string
  unit?: string
  quantity: number
  unitPrice: number
  total: number
  csosn?: string
  cstIcms?: string
}

export interface FiscalSnapshotPayment {
  method?: string
  amount: number
}

export interface FiscalSnapshot {
  sale?: FiscalSnapshotSale
  establishment?: FiscalSnapshotEstablishment
  customer?: FiscalSnapshotCustomer | null
  items?: FiscalSnapshotItem[]
  payments?: FiscalSnapshotPayment[]
}

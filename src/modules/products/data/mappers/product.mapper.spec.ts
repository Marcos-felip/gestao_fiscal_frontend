import { describe, expect, it } from 'vitest'
import {
  toProduct,
  toProductList,
} from '@/modules/products/data/mappers/product.mapper'
import { Product } from '@/modules/products/domain/entities/product.entity'
import { ContractError } from '@/core/errors/contract-error'

const respostaValida = {
  id: 'prod-1',
  companyId: 'comp-1',
  name: 'Tênis Nike Air',
  description: 'Calçado esportivo',
  sku: '124617209',
  barcode: '7891234567890',
  unit: 'PC',
  costPrice: '120.5000',
  salePrice: '249.9000',
  currentStock: '8.0000',
  minStock: '10.0000',
  isActive: true,
  ncm: '64041900',
  cest: '2810400',
  cfop: '5102',
  origin: 0,
  technicalAttributes: { cor: 'amarelo', numeracao: 42 },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
}

describe('toProduct', () => {
  it('constrói a entidade convertendo Decimal (string) para número', () => {
    const result = toProduct(respostaValida)

    expect(result.isRight).toBe(true)
    const product = result.right
    expect(product).toBeInstanceOf(Product)
    expect(product.costPrice).toBe(120.5)
    expect(product.salePrice).toBe(249.9)
    expect(product.currentStock).toBe(8)
    expect(product.minStock).toBe(10)
    expect(product.technicalAttributes).toEqual({ cor: 'amarelo', numeracao: 42 })
  })

  it('marca estoque baixo quando currentStock <= minStock', () => {
    const result = toProduct(respostaValida)

    expect(result.isRight).toBe(true)
    expect(result.right.isLowStock).toBe(true)
  })

  it('aplica defaults quando campos opcionais vêm ausentes', () => {
    const result = toProduct({
      id: 'prod-2',
      companyId: 'comp-1',
      name: 'Item simples',
    })

    expect(result.isRight).toBe(true)
    const product = result.right
    expect(product.unit).toBe('UN')
    expect(product.costPrice).toBeNull()
    expect(product.salePrice).toBeNull()
    expect(product.currentStock).toBe(0)
    expect(product.minStock).toBeNull()
    expect(product.isActive).toBe(true)
    expect(product.isLowStock).toBe(false)
    expect(product.technicalAttributes).toBeNull()
  })

  it('rejeita resposta com campo de tipo errado (ContractError)', () => {
    const result = toProduct({ ...respostaValida, name: 123 })

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error).toBeInstanceOf(ContractError)
    expect(error.resource).toBe('products')
    expect(error.issues.join(' ')).toContain('name')
  })

  it('rejeita resposta sem name e aponta o campo que falhou', () => {
    const { name: _name, ...semName } = respostaValida

    const result = toProduct(semName)

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error.resource).toBe('products')
    expect(error.issues.join(' ')).toContain('name')
  })
})

describe('toProductList', () => {
  it('lê o envelope paginado e traduz data → items', () => {
    const result = toProductList({
      data: [
        respostaValida,
        { id: 'prod-2', companyId: 'comp-1', name: 'Outro' },
      ],
      total: 2,
      page: 1,
      limit: 20,
    })

    expect(result.isRight).toBe(true)
    const list = result.right
    expect(list.items).toHaveLength(2)
    expect(list.items[1]).toBeInstanceOf(Product)
    expect(list.total).toBe(2)
    expect(list.page).toBe(1)
    expect(list.limit).toBe(20)
  })

  it('rejeita quando o envelope não tem total (ContractError)', () => {
    const result = toProductList({ data: [], page: 1, limit: 20 })

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('rejeita quando o payload não é o envelope esperado', () => {
    const result = toProductList(respostaValida)

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

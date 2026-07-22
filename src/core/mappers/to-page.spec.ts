import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { toPage } from '@/core/mappers/to-page'
import { ContractError } from '@/core/errors/contract-error'

class Product {
  readonly id: string
  readonly name: string

  constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }
}

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().nullable().default(null),
})

const toProductPage = toPage(
  'products',
  productSchema,
  (p) => new Product(p.id, p.name),
)

const paginaValida = {
  data: [
    { id: 'p1', name: 'Cimento', sku: 'CIM-01' },
    { id: 'p2', name: 'Areia' },
  ],
  total: 42,
  page: 1,
  limit: 20,
}

describe('toPage', () => {
  it('constrói as entidades e preserva o envelope de paginação', () => {
    const result = toProductPage(paginaValida)

    expect(result.isRight).toBe(true)
    const page = result.right
    expect(page.total).toBe(42)
    expect(page.page).toBe(1)
    expect(page.limit).toBe(20)
    expect(page.data).toHaveLength(2)
    expect(page.data[0]).toBeInstanceOf(Product)
    expect(page.data[0].name).toBe('Cimento')
  })

  it('aceita lista vazia', () => {
    const result = toProductPage({ ...paginaValida, data: [], total: 0 })

    expect(result.isRight).toBe(true)
    expect(result.right.data).toEqual([])
  })

  it('rejeita quando um item da lista quebra o contrato', () => {
    const result = toProductPage({
      ...paginaValida,
      data: [{ id: 'p1' }],
    })

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error.resource).toBe('products')
    expect(error.issues.join(' ')).toContain('name')
  })

  it('rejeita quando o envelope de paginação está incompleto', () => {
    const { total: _t, ...semTotal } = paginaValida

    const result = toProductPage(semTotal)

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('não expõe falha de contrato ao usuário', () => {
    expect(toProductPage('nada disso').left.isUserFacing).toBe(false)
  })
})

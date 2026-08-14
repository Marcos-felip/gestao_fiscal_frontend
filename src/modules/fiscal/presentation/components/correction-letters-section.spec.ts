import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CorrectionLettersSection from './correction-letters-section.vue'
import { FiscalCorrectionLetter } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'

/**
 * Nota corrigida é exceção. A seção precisa sumir por completo quando não há
 * correção — um cartão vazio em toda tela de documento só ocuparia espaço.
 */

const carta = (sequencia: number, xmlEvento: string | null = '<xml/>') =>
  new FiscalCorrectionLetter({
    id: `cce-${sequencia}`,
    fiscalDocumentId: 'doc-1',
    sequencia,
    correcao: `Corrigir o bairro do destinatario (${sequencia})`,
    condicaoDeUso: null,
    protocolo: '131260000000001',
    xmlEvento,
    createdAt: new Date('2026-08-14T12:00:00Z'),
  })

const montar = (letters: FiscalCorrectionLetter[]) =>
  mount(CorrectionLettersSection, {
    props: { letters, downloadingSequencia: null },
    global: { stubs: { Icon: true } },
  })

describe('CorrectionLettersSection', () => {
  it('não renderiza nada quando o documento não tem correção', () => {
    expect(montar([]).text()).toBe('')
  })

  it('lista as correções na ordem da sequência', () => {
    const texto = montar([carta(1), carta(2)]).text()

    expect(texto).toContain('1ª')
    expect(texto).toContain('2ª')
    expect(texto.indexOf('1ª')).toBeLessThan(texto.indexOf('2ª'))
  })

  it('emite o pedido de download da correção escolhida', async () => {
    const wrapper = montar([carta(1), carta(2)])

    await wrapper.findAll('button')[1].trigger('click')

    const evento = wrapper.emitted('download')
    expect(evento).toBeTruthy()
    expect((evento?.[0][0] as FiscalCorrectionLetter).sequencia).toBe(2)
  })

  it('não oferece download da correção sem XML guardado', () => {
    const wrapper = montar([carta(1, null)])

    expect(wrapper.findAll('button')).toHaveLength(0)
  })
})

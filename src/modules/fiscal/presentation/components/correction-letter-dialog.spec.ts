import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CorrectionLetterDialog from './correction-letter-dialog.vue'

/**
 * Quem abre a carta de correção quase sempre quer corrigir algo que a CC-e não
 * corrige. A orientação legal precisa estar visível **antes** do campo de texto
 * — recusar depois ensinaria errado.
 */

const montar = (props: Record<string, unknown> = {}) =>
  mount(CorrectionLetterDialog, {
    props: { modelValue: true, restantes: 20, ...props },
    global: {
      stubs: {
        Icon: true,
        // O Modal usa Teleport; o stub mantém o conteúdo no wrapper.
        Modal: { template: '<div><slot /><slot name="footer" /></div>' },
      },
    },
  })

describe('CorrectionLetterDialog', () => {
  it('lista o que a carta de correção não altera', () => {
    const texto = montar().text()

    expect(texto).toContain('Valores')
    expect(texto).toContain('Data de emissão')
    expect(texto).toContain('cancelar e emitir uma nova nota')
  })

  it('informa quantas correções ainda cabem', () => {
    expect(montar({ restantes: 17 }).text()).toContain('17')
  })

  it('bloqueia o campo e explica quando o limite legal foi atingido', () => {
    const wrapper = montar({ restantes: 0 })

    expect(wrapper.text()).toContain('correções permitidas')
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
  })

  it('não envia texto curto demais — o erro aparece no campo', async () => {
    const wrapper = montar()

    await wrapper.find('textarea').setValue('Bairro')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('confirm')).toBeFalsy()
    expect(wrapper.text()).toContain('mínimo 15')
  })

  it('emite a correção válida já aparada', async () => {
    const wrapper = montar()

    await wrapper.find('textarea').setValue('  Corrigir o bairro do cliente  ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('confirm')?.[0]).toEqual([
      'Corrigir o bairro do cliente',
    ])
  })

  it('exibe a condição de uso vigente quando o servidor a informou', () => {
    const texto = montar({
      condicaoDeUso: 'A Carta de Correcao e disciplinada pelo art. 7...',
    }).text()

    expect(texto).toContain('disciplinada pelo art. 7')
  })
})

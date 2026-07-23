import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NavbarButton from './navbar-button.vue'

describe('NavbarButton', () => {
  it('encaminha o clique para quem consome via @click', async () => {
    const onClick = vi.fn()
    const wrapper = mount(NavbarButton, {
      attrs: { onClick },
      slots: { default: 'X' },
    })

    await wrapper.find('button').trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

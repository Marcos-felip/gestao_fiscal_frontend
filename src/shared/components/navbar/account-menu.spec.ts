import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/', name: 'dashboard' }),
}))

import AccountMenu from './account-menu.vue'

describe('AccountMenu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('abre o menu ao clicar no botão do avatar', async () => {
    const wrapper = mount(AccountMenu)

    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
  })
})

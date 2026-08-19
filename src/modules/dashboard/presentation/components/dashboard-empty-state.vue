<script setup lang="ts">
/**
 * Primeiros passos de uma empresa sem movimento nenhum.
 *
 * Aparece no lugar dos cartões, não junto deles: seis cartões zerados não
 * ensinam o que fazer, e quem acabou de criar a conta precisa de um caminho,
 * não de um relatório vazio.
 *
 * Cada passo some quando falta a permissão — sugerir uma tela que vai dar 403 é
 * pior do que não sugerir nada.
 */
import { computed } from 'vue'
import { motion } from 'motion-v'
import { Icon } from '@/shared/ui'
import { usePermissions } from '@/shared/composables/usePermissions'
import { routeNames } from '@/router/route-names'
import type { RouteName } from '@/router/route-names'

defineEmits<{ go: [name: RouteName] }>()

const { can } = usePermissions()

interface Step {
  key: string
  icon: string
  title: string
  description: string
  route: RouteName
  permission: string
}

const steps = computed<Step[]>(() =>
  [
    {
      key: 'products',
      icon: 'Package',
      title: 'Cadastre seus produtos',
      description: 'É o que o PDV vende e o que a nota fiscal descreve.',
      route: routeNames.PRODUCTS,
      permission: 'products.create',
    },
    {
      key: 'partners',
      icon: 'Store',
      title: 'Cadastre clientes e fornecedores',
      description: 'Quem compra de você e de quem você compra.',
      route: routeNames.PARTNERS,
      permission: 'partners.create',
    },
    {
      key: 'nfe-import',
      icon: 'FileText',
      title: 'Importe a nota de entrada',
      description: 'O XML do fornecedor vira compra sem redigitação.',
      route: routeNames.NFE_IMPORTS,
      permission: 'purchases.import',
    },
    {
      key: 'pdv',
      icon: 'Wallet',
      title: 'Abra o caixa e venda',
      description: 'A primeira venda concluída acende os indicadores daqui.',
      route: routeNames.PDV,
      permission: 'sales.create',
    },
  ].filter((step) => can(step.permission)),
)
</script>

<template>
  <motion.section
    :initial="{ opacity: 0, y: 18 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ delay: 0.15, type: 'spring', stiffness: 300, damping: 30 }"
    class="rounded-2xl border border-dashed border-line-3 bg-background-1 p-6"
  >
    <div class="flex flex-col items-center text-center">
      <span
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary"
      >
        <Icon name="Rocket" size="md" />
      </span>
      <h2 class="mt-4 text-lg font-bold tracking-tight text-foreground">
        Sua operação ainda não tem movimento
      </h2>
      <p class="mt-1 max-w-md text-sm text-muted-foreground">
        Os indicadores desta tela aparecem sozinhos assim que as primeiras
        vendas, notas e títulos forem registrados.
      </p>
    </div>

    <ul
      v-if="steps.length > 0"
      class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <li v-for="step in steps" :key="step.key">
        <button
          type="button"
          class="flex h-full w-full items-start gap-3 rounded-xl border border-line-2 bg-background p-4 text-left transition-colors hover:border-primary-200 hover:bg-primary-50"
          @click="$emit('go', step.route)"
        >
          <span
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary"
          >
            <Icon :name="step.icon" size="sm" />
          </span>
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-foreground">
              {{ step.title }}
            </span>
            <span class="mt-0.5 block text-xs text-muted-foreground">
              {{ step.description }}
            </span>
          </span>
        </button>
      </li>
    </ul>
  </motion.section>
</template>

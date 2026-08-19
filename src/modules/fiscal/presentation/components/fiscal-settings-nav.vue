<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/shared/ui'

/**
 * Coluna de navegação da configuração fiscal.
 *
 * A configuração tem seis assuntos de peso muito diferente — ambiente,
 * certificado, CSC, comunicação, produção — e empilhá-los numa coluna só
 * obrigava a rolar a página inteira para chegar ao último. Aqui cada assunto é
 * um destino com URL própria, e o que está pendente aparece na própria lista,
 * sem precisar abrir.
 */

export interface FiscalSettingsNavItem {
  /** Valor do parâmetro `:secao` da rota. */
  id: string
  label: string
  icon: string
  /** Marca visual de pendência: `null` quando o item está resolvido. */
  pendencia?: 'atencao' | 'erro' | null
  /** Texto curto à direita — situação atual do item. */
  resumo?: string | null
}

const props = defineProps<{
  items: FiscalSettingsNavItem[]
  active: string
}>()

const emit = defineEmits<{ select: [id: string] }>()

const pendentes = computed(
  () => props.items.filter((item) => item.pendencia).length,
)
</script>

<template>
  <nav class="w-full shrink-0 lg:w-64" aria-label="Seções da configuração fiscal">
    <p
      class="mb-2 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
    >
      Configuração
    </p>

    <ul class="space-y-0.5">
      <li v-for="item in props.items" :key="item.id">
        <button
          type="button"
          class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors"
          :class="
            item.id === props.active
              ? 'bg-primary/10 font-medium text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          "
          :aria-current="item.id === props.active ? 'page' : undefined"
          @click="emit('select', item.id)"
        >
          <Icon :name="item.icon" size="sm" class="shrink-0" />

          <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>

          <!-- Pendência aparece na lista: o que falta não deveria exigir
               abrir cada seção para descobrir. -->
          <Icon
            v-if="item.pendencia === 'erro'"
            name="CircleAlert"
            size="xs"
            class="shrink-0 text-error-600"
            aria-label="Impede a emissão"
          />
          <Icon
            v-else-if="item.pendencia === 'atencao'"
            name="TriangleAlert"
            size="xs"
            class="shrink-0 text-warning-600"
            aria-label="Requer atenção"
          />
          <span
            v-else-if="item.resumo"
            class="shrink-0 text-[11px] tabular-nums opacity-70"
          >
            {{ item.resumo }}
          </span>
        </button>
      </li>
    </ul>

    <p
      v-if="pendentes > 0"
      class="mt-3 flex items-start gap-1.5 rounded-lg bg-warning-500/10 px-3 py-2 text-[11px] text-warning-700"
    >
      <Icon name="Info" size="xs" class="mt-0.5 shrink-0" />
      <span>
        {{ pendentes }}
        {{ pendentes === 1 ? 'item pendente' : 'itens pendentes' }} antes de
        emitir.
      </span>
    </p>
  </nav>
</template>

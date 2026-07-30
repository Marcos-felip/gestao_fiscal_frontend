<script setup lang="ts">
import { Icon } from '@/shared/ui'
import Modal from '@/shared/components/dialog/modal.vue'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

/** `keys` são exibidas como keycaps na ordem informada. */
const shortcuts: { keys: string[]; label: string }[] = [
  { keys: ['F2'], label: 'Buscar produto' },
  { keys: ['↑', '↓'], label: 'Navegar nos resultados' },
  { keys: ['Enter'], label: 'Adicionar produto selecionado' },
  { keys: ['F4'], label: 'Finalizar venda (baixa estoque)' },
  { keys: ['F6'], label: 'Salvar como orçamento' },
  { keys: ['F8'], label: 'Cancelar venda em andamento' },
  { keys: ['Esc'], label: 'Limpar a busca' },
  { keys: ['F1'], label: 'Abrir esta ajuda' },
]
</script>

<template>
  <Modal
    :model-value="modelValue"
    title="Atalhos do PDV"
    description="Opere a venda inteira pelo teclado."
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-start gap-3">
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <Icon name="Keyboard" size="md" />
        </span>
        <div>
          <h2 class="font-semibold tracking-tight text-foreground">
            Atalhos do PDV
          </h2>
          <p class="mt-0.5 text-sm text-muted-foreground">
            Opere a venda inteira pelo teclado.
          </p>
        </div>
      </div>
    </template>

    <ul class="divide-y divide-line-2">
      <li
        v-for="item in shortcuts"
        :key="item.label"
        class="flex items-center justify-between gap-4 py-2.5"
      >
        <span class="text-sm text-foreground">{{ item.label }}</span>
        <span class="flex shrink-0 items-center gap-1">
          <kbd
            v-for="key in item.keys"
            :key="key"
            class="min-w-7 rounded-md border border-line-2 bg-muted px-2 py-1 text-center font-mono text-xs font-semibold text-foreground"
          >
            {{ key }}
          </kbd>
        </span>
      </li>
    </ul>

    <p
      class="mt-4 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground"
    >
      <Icon name="Maximize" size="xs" />
      Use o botão de tela cheia na barra superior para o modo quiosque.
    </p>
  </Modal>
</template>

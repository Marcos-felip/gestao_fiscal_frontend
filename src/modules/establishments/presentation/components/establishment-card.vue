<script setup lang="ts">
import { computed } from 'vue'
import { Icon, Tooltip } from '@/shared/ui'
import { formatCnpj } from '@/shared/ui/utils/masks'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'

const props = defineProps<{
  establishment: Establishment
  deleting?: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const cnpjDisplay = computed(() =>
  props.establishment.cnpj ? formatCnpj(props.establishment.cnpj) : '—',
)
</script>

<template>
  <div
    class="ui-shadow-soft flex flex-col rounded-xl border border-line-2 bg-background p-5 transition-colors hover:border-line-3"
  >
    <!-- Cabeçalho -->
    <div class="flex items-center gap-3">
      <span
        :class="[
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          establishment.isMatriz
            ? 'ui-shadow-soft bg-gradient-to-br from-primary-600 to-secondary-500 text-white'
            : 'bg-muted text-foreground/70',
        ]"
      >
        <Icon :name="establishment.isMatriz ? 'Building2' : 'Store'" size="md" />
      </span>

      <div class="min-w-0">
        <h3 class="truncate font-semibold text-foreground">
          {{ establishment.name }}
        </h3>
        <span
          :class="[
            'mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            establishment.isMatriz
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground',
          ]"
        >
          {{ establishment.isMatriz ? 'Matriz' : 'Filial' }}
        </span>
      </div>
    </div>

    <!-- Detalhes -->
    <dl class="mt-4 space-y-1.5 text-sm text-muted-foreground">
      <div class="flex items-center gap-2">
        <Icon name="Landmark" size="xs" class="shrink-0" />
        <span class="tabular-nums">{{ cnpjDisplay }}</span>
      </div>
      <div class="flex items-center gap-2">
        <Icon name="MapPin" size="xs" class="shrink-0" />
        <span class="truncate">{{ establishment.location || '—' }}</span>
      </div>
    </dl>

    <!-- Ações -->
    <div
      class="mt-4 flex items-center justify-end gap-1 border-t border-line-2 pt-3"
    >
      <button
        type="button"
        class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Editar"
        @click="emit('edit')"
      >
        <Icon name="Pencil" size="sm" />
      </button>

      <Tooltip
        v-if="establishment.isMatriz"
        text="A matriz não pode ser excluída."
      >
        <button
          type="button"
          disabled
          class="cursor-not-allowed rounded-lg p-2 text-muted-foreground opacity-40"
          aria-label="Excluir (indisponível para matriz)"
        >
          <Icon name="Trash2" size="sm" />
        </button>
      </Tooltip>
      <button
        v-else
        type="button"
        :disabled="deleting"
        class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        aria-label="Excluir"
        @click="emit('delete')"
      >
        <Icon name="Trash2" size="sm" />
      </button>
    </div>
  </div>
</template>

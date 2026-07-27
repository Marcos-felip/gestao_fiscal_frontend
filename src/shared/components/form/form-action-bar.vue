<template>
  <Transition name="action-bar">
    <div v-if="visible" class="sticky bottom-4 z-10 mt-6">
      <div
        :class="[
          'ui-shadow-float flex items-center gap-3 rounded-xl border border-line-2 bg-background/90 px-4 py-3 backdrop-blur-md',
          showStatus ? 'justify-between' : 'justify-end',
        ]"
      >
        <!-- Indicador de alterações não salvas (só existe quando visível). -->
        <p
          v-if="showStatus"
          class="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span class="size-2 rounded-full bg-warning" />
          Alterações não salvas
        </p>

        <div class="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            :disabled="loading"
            @click="emit('secondary')"
          >
            {{ secondaryLabel }}
          </Button>
          <Button
            type="submit"
            variant="primary"
            text-class="text-white"
            :loading="loading"
            :loading-text="loadingText"
          >
            <template #icon>
              <Icon name="Check" size="sm" />
            </template>
            {{ submitLabel }}
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button, Icon } from '@/shared/ui'

/**
 * FormActionBar
 *
 * Barra de ações flutuante (sticky) para formulários: botão secundário
 * (Cancelar/Descartar) + submit com estado de loading.
 *
 * - Com `show-status`: comportamento "save bar" — a barra só aparece (com
 *   transição) quando há alterações não salvas (`:dirty`). Enquanto tudo está
 *   salvo, ela some, evitando ruído visual.
 * - Sem `show-status`: sempre visível (fluxos de criar/editar, onde o submit
 *   precisa estar disponível desde o início).
 *
 * O submit é `type="submit"`, então o `@submit` do <form> pai é quem dispara o
 * envio; o botão secundário emite o evento `secondary`.
 */
const props = withDefaults(
  defineProps<{
    submitLabel: string
    loading?: boolean
    loadingText?: string
    secondaryLabel?: string
    showStatus?: boolean
    dirty?: boolean
  }>(),
  {
    loading: false,
    loadingText: 'Salvando…',
    secondaryLabel: 'Cancelar',
    showStatus: false,
    dirty: false,
  },
)

const emit = defineEmits<{ secondary: [] }>()

const visible = computed(() => !props.showStatus || props.dirty)
</script>

<style scoped lang="css">
.action-bar-enter-active,
.action-bar-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.action-bar-enter-from,
.action-bar-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .action-bar-enter-active,
  .action-bar-leave-active {
    transition: opacity 200ms ease;
  }
  .action-bar-enter-from,
  .action-bar-leave-to {
    transform: none;
  }
}
</style>

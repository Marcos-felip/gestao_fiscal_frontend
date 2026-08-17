<template>
  <Transition name="action-bar">
    <div v-if="visible" class="sticky bottom-4 z-10 mt-6">
      <div
        :class="[
          'ui-shadow-float flex items-center gap-3 rounded-xl border border-line-2 bg-background/90 px-4 py-3 backdrop-blur-md',
          props.dirty ? 'justify-between' : 'justify-end',
        ]"
      >
        <!-- Indicador de alterações não salvas (só existe quando visível). -->
        <p
          v-if="props.dirty"
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
 * **A barra só aparece quando há alteração.** Entrar num formulário e já
 * encontrar "Salvar" flutuando é ruído: não há o que salvar ainda, e a barra
 * ocupa espaço na leitura de quem só veio conferir um cadastro. Ela entra com
 * transição no primeiro campo alterado — é a mesma ideia da "save bar" que a
 * configuração fiscal e a tela de conta já usavam, agora padrão para todos.
 *
 * `always` é a exceção, e existe por um caso concreto: formulário que **nasce
 * preenchido** — o cadastro de produto a partir do XML da nota de entrada — não
 * tem o que alterar, e esconder a barra tiraria o único caminho adiante.
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
    /** Há alteração pendente? É o que faz a barra aparecer. */
    dirty?: boolean
    /** Mantém a barra visível mesmo sem alteração. Ver o comentário acima. */
    always?: boolean
  }>(),
  {
    loading: false,
    loadingText: 'Salvando…',
    secondaryLabel: 'Cancelar',
    dirty: false,
    always: false,
  },
)

const emit = defineEmits<{ secondary: [] }>()

const visible = computed(() => props.always || props.dirty)
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

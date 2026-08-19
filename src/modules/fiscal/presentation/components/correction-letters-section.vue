<script setup lang="ts">
import { Button, Icon } from '@/shared/ui'
import FormSection from '@/shared/components/form/form-section.vue'
import type { FiscalCorrectionLetter } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'
import { formatDateTime } from '@/core/utils/date'

/**
 * Histórico de correções da nota.
 *
 * A seção só existe quando há correção: uma nota corrigida é exceção, e um
 * cartão vazio em toda tela de documento só ocuparia espaço.
 */

const props = defineProps<{
  letters: FiscalCorrectionLetter[]
  downloadingSequencia: number | null
}>()

const emit = defineEmits<{ download: [letter: FiscalCorrectionLetter] }>()
</script>

<template>
  <FormSection
    v-if="props.letters.length > 0"
    icon="PenLine"
    title="Cartas de correção"
    :description="`${props.letters.length} correção(ões) registrada(s) na SEFAZ para esta nota.`"
  >
    <ol class="space-y-3">
      <li
        v-for="letter in props.letters"
        :key="letter.id"
        class="rounded-xl border border-line-2 px-4 py-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="flex items-center gap-2 text-sm font-medium text-foreground">
              <span
                class="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs tabular-nums text-primary"
              >
                {{ letter.sequencia }}ª
              </span>
              {{ formatDateTime(letter.createdAt.toISOString()) }}
            </p>
            <p class="mt-1.5 text-sm break-words text-foreground">
              {{ letter.correcao }}
            </p>
            <p
              v-if="letter.protocolo"
              class="mt-1 text-xs tabular-nums text-muted-foreground"
            >
              Protocolo {{ letter.protocolo }}
            </p>
          </div>

          <Button
            v-if="letter.hasXml"
            variant="ghost"
            size="sm"
            :loading="props.downloadingSequencia === letter.sequencia"
            :disabled="
              props.downloadingSequencia !== null &&
              props.downloadingSequencia !== letter.sequencia
            "
            @click="emit('download', letter)"
          >
            <template #icon><Icon name="FileDown" size="sm" /></template>
            XML
          </Button>
        </div>
      </li>
    </ol>
  </FormSection>
</template>

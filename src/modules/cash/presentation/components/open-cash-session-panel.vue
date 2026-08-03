<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { Button, Icon, Input, Select, Spinner } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'
import {
  validateOpenCashSession,
  type OpenCashSessionErrors,
} from '@/modules/cash/presentation/schemas/open-cash-session-schema'
import { OpenCashSessionDto } from '@/modules/cash/domain/dto/open-cash-session-dto'
import type { CashRegister } from '@/modules/cash/domain/entities/cash-register.entity'
import { formatMoneyInput, parseDecimal } from '@/shared/ui/utils/masks'

const props = withDefaults(
  defineProps<{
    registers: CashRegister[]
    registersLoaded: boolean
    opening?: boolean
    canManageRegisters?: boolean
  }>(),
  { opening: false, canManageRegisters: false },
)

const emit = defineEmits<{
  open: [dto: OpenCashSessionDto]
  exit: []
  'manage-registers': []
}>()

const form = reactive({ cashRegisterId: '', openingAmount: '' })
const errors = ref<OpenCashSessionErrors>({})

const registerOptions = computed<SelectOption[]>(() =>
  props.registers.map((r) => ({
    value: r.id,
    label: r.establishmentName ? `${r.name} · ${r.establishmentName}` : r.name,
  })),
)

const hasRegisters = computed(() => props.registers.length > 0)

// Pré-seleciona quando só existe um caixa.
watch(
  () => props.registers,
  (registers) => {
    if (registers.length === 1) form.cashRegisterId = registers[0].id
  },
  { immediate: true },
)

function submit(): void {
  const result = validateOpenCashSession({ ...form })
  errors.value = result.errors
  if (!result.ok) return

  emit(
    'open',
    new OpenCashSessionDto({
      cashRegisterId: form.cashRegisterId,
      openingAmount: parseDecimal(form.openingAmount) ?? 0,
    }),
  )
}
</script>

<template>
  <div class="flex h-dvh flex-col bg-muted/30">
    <!-- Barra superior -->
    <header
      class="flex items-center justify-between gap-4 bg-foreground px-4 py-2.5 text-background sm:px-6"
    >
      <div class="flex min-w-0 items-center gap-3">
        <img
          src="/apple-touch-icon.png"
          alt="Gestão Fiscal"
          class="size-9 shrink-0 rounded-lg bg-white object-contain"
        />
        <div class="min-w-0 leading-tight">
          <p class="font-display text-sm font-bold tracking-tight">
            Gestão Fiscal
          </p>
          <p class="truncate text-xs text-background/60">PDV · Abertura de caixa</p>
        </div>
      </div>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-background/80 transition-colors hover:bg-error-500/20 hover:text-white"
        title="Sair do PDV"
        @click="emit('exit')"
      >
        <Icon name="LogOut" size="sm" />
        <span class="hidden sm:inline">Sair</span>
      </button>
    </header>

    <!-- Corpo centralizado -->
    <div class="flex flex-1 items-center justify-center overflow-y-auto p-4">
      <!-- Carregando os caixas -->
      <div
        v-if="!props.registersLoaded"
        class="flex flex-col items-center gap-3 text-muted-foreground"
      >
        <Spinner />
        <p class="text-sm">Carregando caixas…</p>
      </div>

      <!-- Nenhum caixa cadastrado -->
      <div
        v-else-if="!hasRegisters"
        class="w-full max-w-md rounded-3xl border border-dashed border-line-3 bg-background px-6 py-12 text-center"
      >
        <span
          class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
        >
          <Icon name="MonitorOff" size="lg" />
        </span>
        <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
          Nenhum caixa cadastrado
        </h2>
        <p class="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          Cadastre um terminal de caixa antes de operar o PDV.
        </p>
        <div v-if="props.canManageRegisters" class="mt-5">
          <Button variant="primary" text-class="text-white" @click="emit('manage-registers')">
            <template #icon><Icon name="Plus" size="sm" /></template>
            Cadastrar caixa
          </Button>
        </div>
      </div>

      <!-- Formulário de abertura -->
      <motion.div
        v-else
        class="ui-shadow-float w-full max-w-md rounded-3xl border border-line-2 bg-background p-6 sm:p-8"
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.2 }"
      >
        <div class="mb-6 flex items-center gap-3">
          <span
            class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <Icon name="LockOpen" size="md" />
          </span>
          <div>
            <h1 class="font-display text-xl font-bold tracking-tight text-foreground">
              Abrir caixa
            </h1>
            <p class="text-sm text-muted-foreground">
              Informe o fundo de troco para começar.
            </p>
          </div>
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <Select
            v-if="registerOptions.length > 1"
            v-model="form.cashRegisterId"
            :options="registerOptions"
            placeholder="Selecione o caixa"
            :error="errors.cashRegisterId"
          >
            <template #label>Caixa</template>
          </Select>

          <div
            v-else
            class="flex items-center gap-2 rounded-xl border border-line-2 bg-muted/40 px-4 py-3 text-sm"
          >
            <Icon name="Monitor" size="sm" class="text-muted-foreground" />
            <span class="font-medium text-foreground">
              {{ registerOptions[0]?.label }}
            </span>
          </div>

          <Input
            :model-value="form.openingAmount"
            :sanitize="formatMoneyInput"
            inputmode="decimal"
            placeholder="0,00"
            input-class="text-right"
            :error="errors.openingAmount"
            @update:model-value="form.openingAmount = $event"
          >
            <template #label>Fundo de troco</template>
            <template #prefix><span class="text-xs text-muted-foreground">R$</span></template>
          </Input>

          <Button
            variant="primary"
            text-class="text-white"
            class="w-full"
            :loading="props.opening"
            @click="submit"
          >
            <template #icon><Icon name="LockOpen" size="sm" /></template>
            Abrir caixa
          </Button>
        </form>
      </motion.div>
    </div>
  </div>
</template>

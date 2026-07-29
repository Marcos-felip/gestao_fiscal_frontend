<script setup lang="ts">
import { Icon, Input, Select } from '@/shared/ui'
import { taxRegimeOptions } from '@/enums/tax-regime.enum'
import { formatCnpj, formatPhone } from '@/shared/ui/utils/masks'
import { useOnboardingContext } from '@/modules/companies/presentation/composables/useOnboardingContext'

const { form, errors } = useOnboardingContext()
</script>

<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
    <Input
      :model-value="form.cnpj"
      maxlength="18"
      inputmode="numeric"
      placeholder="00.000.000/0000-00"
      :error="errors.cnpj"
      @update:model-value="form.cnpj = formatCnpj($event)"
    >
      <template #prefix><Icon name="Landmark" size="sm" /></template>
      <template #label>CNPJ</template>
    </Input>

    <Select
      v-model="form.taxRegime"
      :options="taxRegimeOptions"
      placeholder="Selecione"
      :error="errors.taxRegime"
    >
      <template #label>Regime tributário</template>
    </Select>

    <div class="sm:col-span-2">
      <Input
        :model-value="form.phone"
        maxlength="15"
        inputmode="tel"
        placeholder="(00) 00000-0000"
        :error="errors.phone"
        @update:model-value="form.phone = formatPhone($event)"
      >
        <template #prefix><Icon name="Phone" size="sm" /></template>
        <template #label>Telefone</template>
      </Input>
    </div>
  </div>
</template>

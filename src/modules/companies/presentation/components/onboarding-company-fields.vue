<script setup lang="ts">
import { Input, Select } from '@/shared/ui'
import { companyTypeOptions } from '@/core/enums/company-type.enum'
import { useOnboardingContext } from '@/shared/composables/useOnboardingContext'

const { form, errors } = useOnboardingContext()
</script>

<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
    <div class="sm:col-span-2">
      <Input
        v-model="form.name"
        maxlength="120"
        placeholder="Razão social"
        :error="errors.name"
      >
        <template #label>Nome da empresa</template>
      </Input>
    </div>
    <div class="sm:col-span-2">
      <Select
        v-model="form.type"
        :options="companyTypeOptions"
        placeholder="Não informar"
        :error="errors.type"
      >
        <template #label>Tipo de empresa</template>
      </Select>
    </div>
  </div>
</template>

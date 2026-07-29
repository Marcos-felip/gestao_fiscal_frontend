<script setup lang="ts">
import { ref } from 'vue'
import { Icon, Input, Select, Spinner } from '@/shared/ui'
import { brazilianStateOptions } from '@/core/constants/brazilian-states'
import { formatCep, onlyDigits } from '@/shared/ui/utils/masks'
import { fetchAddressByCep } from '@/core/services/via-cep'
import { useOnboardingContext } from '@/shared/composables/useOnboardingContext'

const { form, errors } = useOnboardingContext()

const cepLoading = ref(false)

async function onCepInput(value: string): Promise<void> {
  const masked = formatCep(value)
  const changed = masked !== form.cep
  form.cep = masked
  if (!changed || onlyDigits(masked).length !== 8) return

  cepLoading.value = true
  const address = await fetchAddressByCep(masked)
  cepLoading.value = false
  if (!address) return
  if (address.street) form.street = address.street
  if (address.neighborhood) form.neighborhood = address.neighborhood
  if (address.city) form.city = address.city
  if (address.state) form.state = address.state
}
</script>

<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-6">
    <div class="sm:col-span-3">
      <Input
        v-model="form.establishmentName"
        maxlength="120"
        placeholder="Nome da matriz"
        :error="errors.establishmentName"
      >
        <template #label>Nome do estabelecimento</template>
      </Input>
    </div>
    <div class="sm:col-span-3">
      <Input
        v-model="form.inscricaoEstadual"
        maxlength="20"
        inputmode="numeric"
        placeholder="Inscrição Estadual"
        :error="errors.inscricaoEstadual"
      >
        <template #label>Inscrição Estadual</template>
      </Input>
    </div>
    <div class="sm:col-span-3">
      <Input
        :model-value="form.cep"
        maxlength="9"
        inputmode="numeric"
        placeholder="00000-000"
        :error="errors.cep"
        @update:model-value="onCepInput($event)"
      >
        <template #prefix><Icon name="MapPin" size="sm" /></template>
        <template #suffix>
          <Spinner v-if="cepLoading" size="sm" class="text-primary" />
        </template>
        <template #label>CEP</template>
      </Input>
    </div>
    <div class="sm:col-span-3">
      <Input
        v-model="form.inscricaoMunicipal"
        maxlength="20"
        placeholder="Inscrição Municipal"
      >
        <template #label>Inscrição Municipal</template>
      </Input>
    </div>
    <div class="sm:col-span-4">
      <Input v-model="form.street" placeholder="Rua / Logradouro">
        <template #label>Logradouro</template>
      </Input>
    </div>
    <div class="sm:col-span-2">
      <Input v-model="form.number" placeholder="Número">
        <template #label>Número</template>
      </Input>
    </div>
    <div class="sm:col-span-3">
      <Input v-model="form.neighborhood" placeholder="Bairro">
        <template #label>Bairro</template>
      </Input>
    </div>
    <div class="sm:col-span-2">
      <Input v-model="form.city" placeholder="Cidade">
        <template #label>Cidade</template>
      </Input>
    </div>
    <div class="sm:col-span-1">
      <Select
        v-model="form.state"
        :options="brazilianStateOptions"
        placeholder="UF"
        :error="errors.state"
      >
        <template #label>UF</template>
      </Select>
    </div>
  </div>
</template>

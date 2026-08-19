<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { Icon, Skeleton } from '@/shared/ui'
import { makeFiscalSettingsController } from '@/modules/fiscal/factories/fiscal.factory'
import { routeNames } from '@/router/route-names'

/**
 * Entrada da configuração fiscal.
 *
 * Não é uma tela: é um desvio para o primeiro estabelecimento. A lista que
 * existia aqui era um clique a mais para chegar ao único destino possível —
 * quem tem mais de um estabelecimento troca pelo seletor no topo da própria
 * configuração, sem voltar para cá.
 *
 * A tela só aparece de verdade quando não há estabelecimento nenhum, que é o
 * único caso em que não há para onde desviar.
 */

const controller = makeFiscalSettingsController()

function abrirPrimeiro(): void {
  const primeiro = controller.rows.value[0]
  if (!primeiro) return

  controller.router.replace({
    name: routeNames.FISCAL_SETTINGS_DETAIL,
    params: { establishmentId: primeiro.establishment.id },
  })
}

onMounted(async () => {
  await controller.load()
  abrirPrimeiro()
})

// A carga pode terminar depois do onMounted (troca de empresa ativa, por ex.).
watch(() => controller.rows.value.length, abrirPrimeiro)
</script>

<template>
  <div v-if="!controller.loaded.value" class="space-y-2">
    <Skeleton v-for="n in 3" :key="`sk-${n}`" class="h-20 w-full rounded-xl" />
  </div>

  <div
    v-else-if="controller.rows.value.length === 0"
    class="rounded-2xl border border-dashed border-line-3 bg-background px-6 py-16 text-center"
  >
    <span
      class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
    >
      <Icon name="Store" size="lg" />
    </span>
    <h2 class="font-display mt-4 text-lg font-semibold text-foreground">
      Nenhum estabelecimento
    </h2>
    <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      Cadastre um estabelecimento para configurar a emissão fiscal.
    </p>
  </div>
</template>

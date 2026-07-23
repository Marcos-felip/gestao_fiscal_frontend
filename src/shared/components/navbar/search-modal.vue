<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        :class="[
          'search-modal',
          'fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-24 px-4',
        ]"
        @keydown.escape="close"
        @click="close"
      >
        <div
          :class="[
            'modal-content',
            'w-full max-w-xl rounded-lg border border-border bg-background shadow-lg',
          ]"
          @click.stop
        >
          <!-- Input -->
          <SearchInput
            v-model="query"
            autofocus
            placeholder="Buscar empresas, produtos, documentos..."
            @submit="handleSearch"
            @cancel="close"
            class="border-none rounded-t-lg"
          />

          <!-- Results -->
          <div
            v-if="query"
            :class="[
              'results',
              'max-h-96 overflow-y-auto border-t border-border',
            ]"
          >
            <!-- Placeholder -->
            <div v-if="results.length === 0" class="p-8 text-center">
              <p class="text-sm text-muted-foreground">
                Nenhum resultado encontrado para "{{ query }}"
              </p>
            </div>

            <!-- Result items -->
            <div
              v-for="result in results"
              :key="result.id"
              :class="[
                'result-item',
                'px-4 py-3 border-b border-border hover:bg-muted transition-colors cursor-pointer',
              ]"
              @click="selectResult(result)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-semibold text-foreground">
                    {{ result.title }}
                  </h4>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ result.category }}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SearchInput } from '@/shared/ui'

interface SearchResult {
  id: string
  title: string
  category: 'Empresa' | 'Produto' | 'Documento'
  path?: string
}

interface Props {
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [result: SearchResult]
}>()

const isOpen = ref(props.modelValue)
const query = ref('')

const results = computed((): SearchResult[] => {
  if (!query.value) return []

  // Mock search results
  const mockResults: SearchResult[] = [
    { id: '1', title: 'Acme Corporation', category: 'Empresa' },
    { id: '2', title: 'Produto XYZ-123', category: 'Produto' },
    { id: '3', title: 'NFe 2024-001', category: 'Documento' },
  ]

  return mockResults.filter((r) =>
    r.title.toLowerCase().includes(query.value.toLowerCase()),
  )
})

const close = () => {
  isOpen.value = false
  emit('update:modelValue', false)
}

const handleSearch = () => {
  console.log('Search global for:', query.value)
}

const selectResult = (result: SearchResult) => {
  emit('select', result)
  close()
}
</script>

<style scoped lang="css">
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 150ms ease-in-out;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.search-modal {
  animation: slideDown 200ms ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

import type { Component } from 'vue'
import { Eye, EyeOff, LogIn, MoreVertical, X } from 'lucide-vue-next'

/**
 * Registro central de ícones.
 *
 * ÚNICO ponto do projeto que importa a biblioteca de ícones.
 * - Para trocar a lib de ícones: remapeie os componentes apenas aqui.
 * - Para adicionar um ícone: importe-o e registre com uma chave kebab-case semântica.
 *
 * Consumir sempre via `<Icon name="..." />` — nunca importar lucide-vue-next direto.
 */
export const icons = {
  eye: Eye,
  'eye-off': EyeOff,
  close: X,
  'log-in': LogIn,
  'more-vertical': MoreVertical,
} satisfies Record<string, Component>

export type IconName = keyof typeof icons

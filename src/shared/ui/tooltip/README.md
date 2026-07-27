# Tooltip

Dica contextual acionada por **hover** e **foco** (acessível por teclado).
O slot padrão é o gatilho — normalmente um ícone de ajuda ao lado de um label.

## Props

| Prop        | Tipo                  | Padrão  | Descrição                          |
| ----------- | --------------------- | ------- | ---------------------------------- |
| `text`      | `string`              | —       | Texto exibido na dica.             |
| `placement` | `'top' \| 'bottom'`   | `'top'` | Posição da dica sobre o gatilho.   |

## Slots

- `#default` — o elemento gatilho (ícone, texto, botão…).

## Exemplo

```vue
<Tooltip text="Inscrição Estadual: mínimo de 11 dígitos.">
  <Icon name="HelpCircle" size="sm" class="text-foreground/50" />
</Tooltip>
```

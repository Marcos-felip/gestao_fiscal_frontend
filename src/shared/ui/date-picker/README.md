# DatePicker

Seletor de data com calendário próprio (motion-v + tokens do tema), substituto
do `<input type="date">` nativo. Segue a mesma API de `label`/`hint`/`error` do
`Input`/`Select`. O `modelValue` é uma string `aaaa-MM-dd` (mesmo formato do
input nativo), então combina direto com `dateInputToIso`/`isoToDateInput` de
`@/core/utils/date`.

## Props

| Prop          | Tipo               | Padrão                | Descrição                                          |
| ------------- | ------------------ | --------------------- | -------------------------------------------------- |
| `modelValue`  | `string`           | —                     | Data selecionada em `aaaa-MM-dd` (`v-model`).      |
| `placeholder` | `string`           | `'Selecione a data'`  | Texto quando nada está selecionado.                |
| `disabled`    | `boolean`          | `false`               | Desabilita o campo.                                |
| `error`       | `string`           | `''`                  | Mensagem de erro (borda vermelha + shake).         |
| `hint`        | `string`           | `''`                  | Texto de ajuda abaixo do campo.                    |
| `id`          | `string`           | auto                  | Id do gatilho (liga ao `<label>`).                 |
| `min`         | `string`           | `''`                  | Data mínima selecionável (`aaaa-MM-dd`).           |
| `max`         | `string`           | `''`                  | Data máxima selecionável (`aaaa-MM-dd`).           |
| `align`       | `'start' \| 'end'` | `'start'`             | Alinhamento do painel em relação ao gatilho.       |

## Slots

- `#label` — conteúdo do rótulo (renderizado acima do campo).

## Emits

- `update:modelValue` — ao escolher um dia, usar "Hoje" ou "Limpar" (`''`).

## Acessibilidade / teclado

- Gatilho com `aria-haspopup="dialog"` / `aria-expanded`; dias com `aria-label`
  completo e `aria-current="date"` no dia selecionado.
- `Esc` fecha o painel; clique externo também fecha. Botão de limpar remove a
  seleção (emite `''`).

## Navegação

- Cabeçalho com ‹ / › muda o mês; clicar no título alterna para a **visão de
  meses** (‹ / › muda o ano, grade Jan–Dez). Rodapé com atalhos "Hoje" e
  "Limpar".

## Exemplo

```vue
<DatePicker v-model="form.purchaseDate">
  <template #label>Data da compra</template>
</DatePicker>

<!-- Faixa De/Até com limites cruzados -->
<DatePicker
  :model-value="startValue"
  :max="endValue || undefined"
  placeholder="De"
  @update:model-value="onStartDate"
/>
```

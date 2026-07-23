# PasswordInput

Campo de senha dedicado. Encapsula o alternar **mostrar/ocultar** (ícone
`Eye`/`EyeOff`) para não misturar essa lógica no `Input` genérico. Mesmo visual
do `Input`.

## Uso

```vue
<PasswordInput
  id="login-password"
  v-model="password"
  autocomplete="current-password"
  :error="errors.password"
>
  <template #label>Senha</template>
</PasswordInput>
```

## Props

| Prop           | Tipo                                       | Padrão               |
| -------------- | ------------------------------------------ | -------------------- |
| `modelValue`   | `string`                                   | —                    |
| `id`           | `string`                                   | —                    |
| `label`        | `string` (ou use o slot `label`)           | `''`                 |
| `placeholder`  | `string`                                   | `''`                 |
| `disabled`     | `boolean`                                  | `false`              |
| `error`        | `string`                                   | `''`                 |
| `hint`         | `string`                                   | `''`                 |
| `autocomplete` | `'current-password' \| 'new-password'`     | `'current-password'` |

- Login → `current-password`; cadastro/troca → `new-password`.
- Emits: `update:modelValue`, `blur`, `focus`.

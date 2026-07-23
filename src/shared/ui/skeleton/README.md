# Skeleton

Bloco de carregamento com brilho (shimmer). Use no lugar do conteúdo enquanto
os dados chegam da API — mais moderno que um spinner central.

O **tamanho** e o **arredondamento** vêm de classes utilitárias do consumidor;
o componente só cuida do fundo e da animação.

## Uso

```vue
<Skeleton class="h-4 w-24 rounded" />
<Skeleton class="h-9 w-9 rounded-xl" />
<Skeleton class="h-40 w-full rounded-2xl" />
```

Respeita `prefers-reduced-motion` (desliga o shimmer).

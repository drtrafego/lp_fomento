

## Reduzir Distância entre Último PIX e "Já pensou"

### Problema
O container do `PixNotificationsSection` tem `min-h-[60vh]`, criando espaço vazio entre a última notificação e o texto de transição.

### Mudança

**`src/pages/Index.tsx` linha 628**: Reduzir `min-h-[60vh]` para `min-h-[40vh]` e adicionar `pb-0` para eliminar padding inferior.

**Linha 941**: Reduzir `py-12` para `pt-2 pb-12` no container do "Já pensou" para diminuir o espaço superior.


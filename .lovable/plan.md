

## Corrigir Delay e Aparecimento Súbito das Notificações PIX

### Problema
O container tem `min-h-[40vh]`, que é pouco espaço de scroll para distribuir 5 notificações progressivamente. O cálculo de `progress` mapeia toda a travessia do container (de `0.9vh` a `0.1vh`) — com 40vh de altura, essa faixa é muito curta e as notificações "pulam" todas de uma vez quando o container entra na viewport.

### Solução

**`src/pages/Index.tsx` — PixNotificationsSection:**

1. **Aumentar a altura do container** de `min-h-[40vh]` para `min-h-[200vh]` — isso cria espaço de scroll suficiente para as 5 notificações aparecerem uma a uma conforme o usuário rola

2. **Ajustar o cálculo de progress** para usar a posição do topo do container relativa ao viewport, com uma faixa de scroll mais generosa:
   - `start`: quando o topo do container chega a 80% do viewport
   - `end`: quando o topo do container chega a -100% do viewport (já saiu)
   - Isso distribui as 5 notificações ao longo de ~180vh de scroll

3. **O sticky `top-1/2`** garante que as notificações ficam visíveis no centro da tela enquanto o usuário rola pelo container alto

### Resultado
Cada notificação aparece individualmente conforme o scroll, sem delay artificial nem aparecimento em bloco.


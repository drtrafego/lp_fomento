

## Resultado do Teste das Notificações PIX

### O que foi verificado

- A seção PIX **está renderizando corretamente** no DOM com todas as 5 notificações
- O container tem `min-h-[200vh]` com conteúdo `sticky top-1/2` e lógica de `scrollProgress` baseada em `getBoundingClientRect`
- A seção "Já pensou" aparece logo após
- O layout mobile está correto com `sm:hidden`

### Limitação do teste automatizado

O browser tool usa `scrollTo` que **pula** para posições em vez de simular scroll real com o dedo. Isso impede a verificação visual do efeito progressivo das notificações durante o scroll — o sticky container de 200vh se comporta de forma diferente com `scrollTo` vs. scroll real.

### Recomendação

Para testar de verdade, o ideal é testar manualmente no celular pela URL publicada. Se ainda houver o problema de "delay + aparecimento súbito", posso ajustar:

1. **Reduzir `min-h-[200vh]` para `min-h-[120vh]`** — 200vh pode ser longo demais, criando uma seção vazia antes das notificações aparecerem
2. **Ajustar o cálculo de progress** — atualmente usa `start = vh * 0.8` e `end = -el.offsetHeight + vh * 0.3`. Com 200vh, o range é enorme e as 5 notificações se concentram numa faixa curta. Podemos usar thresholds mais distribuídos.

### Quer que eu ajuste?

Se você ainda está vendo o problema no seu celular, confirme e eu ajusto a altura e o cálculo de progresso para distribuir melhor as notificações ao longo do scroll.


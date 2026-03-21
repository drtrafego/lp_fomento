

## Acelerar o Typewriter — Completar em 20% do Scroll

### Problema
Atualmente os bullets só completam quando o card chega quase no topo da tela (5% do viewport). O usuário quer que tudo esteja revelado quando ainda está no meio da tela (~20% do percurso de scroll).

### Mudança

**`src/components/ScrollTypewriter.tsx`** — Alterar o `end` do cálculo de progresso de `vh * 0.05` para `vh * 0.7`, comprimindo a janela de animação para que todos os bullets completem rapidamente logo após o card entrar na tela.

Isso faz com que:
- Card entra na tela (90% vh) → começa a digitar
- Card chega a 70% vh (~20% do percurso) → tudo já está revelado


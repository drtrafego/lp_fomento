

## Melhorar Visualmente a Primeira Dobra (Hero) no Celular

Baseado na referência enviada e no viewport atual (390x844), vou ajustar o hero para ficar mais impactante no mobile.

### Mudanças em `src/pages/Index.tsx`

1. **Layout mobile-first**: No mobile, empilhar com imagem ABAIXO do texto (já está assim), mas reduzir padding e espaçamentos para aproveitar melhor a tela
2. **Título mais impactante**: Aumentar peso visual do título no mobile — `text-[1.75rem]` com `leading-[1.15]` para ocupar menos linhas e ter mais punch
3. **Badge "AO VIVO" mais destacado**: Aumentar ligeiramente e adicionar borda dourada sutil
4. **Barra de countdown do dia**: Tornar mais compacta no mobile, reduzir padding
5. **Bullets mais compactos**: Reduzir gap entre itens para ganhar espaço vertical
6. **Imagem do header**: Adicionar `rounded-xl` com borda dourada mais visível e um leve glow animado no mobile
7. **CTA mais proeminente**: Botão com `w-full` no mobile para ocupar toda a largura
8. **Linha "Através de Programas..."**: Mover para antes do botão com destaque sutil
9. **Espaçamento geral**: Reduzir `pt-24 pb-16` para `pt-20 pb-10` no mobile, `space-y-5` em vez de `space-y-6`

### Mudanças em `src/index.css`

10. Adicionar um `@keyframes glow-pulse` sutil para a imagem do hero no mobile

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Ajustes de responsividade na seção Hero para mobile |
| `src/index.css` | Keyframe de glow para imagem hero |


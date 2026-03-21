

## Atualizar Vídeos 4-6 + Layout Edge-to-Edge no Mobile

### Dados dos vídeos

| # | Handle | Valor | URL |
|---|--------|-------|-----|
| 4 | @instabov | R$ 730.000 | `https://dunas.b-cdn.net/videos_LP_nova/C9cf30e2-1Bc7-4Fd3-Be82-71C4c74c3769.mp4` |
| 5 | @impargestao | R$ 39.000 | `https://dunas.b-cdn.net/videos_LP_nova/Depoimento%20Impar.mp4` |
| 6 | @globaltec | R$ 500.000 | `https://dunas.b-cdn.net/videos_LP_nova/Ee35e4db-76A3-4274-A3ff-777398B32196.mp4` |

### Mudanças em `src/pages/Index.tsx`

1. **Atualizar testimonials array (linhas 196-198)**: Substituir os 3 placeholders pelos dados reais acima com URLs de vídeo

2. **Layout edge-to-edge no mobile (linha 953)**: Alterar o grid container para remover padding lateral no mobile:
   - Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` → `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6`
   - Cards: remover `rounded-2xl` no mobile (usar `rounded-none sm:rounded-2xl`)
   - Section wrapper: adicionar `px-0 sm:px-6` para o container mobile preencher até a borda




## Atualizar data do Workshop para Quinta-feira 09/04/2026 às 20h

Trocar todas as referências de "Terça-feira dia 31/03" para "Quinta-feira dia 09/04" em dois arquivos.

### Alterações

**`src/pages/Index.tsx`**
1. Linha 41: `getWorkshopDate()` → `new Date(2026, 3, 9, 20, 0, 0)` (abril = mês 3)
2. Linha 176: "HOJE · Terça-feira às 20h" → "HOJE · Quinta-feira às 20h"
3. Linha 185: "Terça-feira dia 31/03/26" → "Quinta-feira dia 09/04/26" (ambas ocorrências no ternário)
4. Linha 271: "Terça-feira às 20h" → "Quinta-feira às 20h"

**`src/components/BelowFoldSections.tsx`**
1. Linha 38 (FAQ): "Terça-feira dia 31/03" → "Quinta-feira dia 09/04"
2. Linha 741: "Terça-feira dia 31/03/26" → "Quinta-feira dia 09/04/26"
3. Linha 896: "Terça-feira às 20h" → "Quinta-feira às 20h"



# Alterar data do Workshop: Terça-feira dia 31/03

O workshop agora é na **terça-feira dia 31/03 às 20h** em vez de quinta-feira. Precisa atualizar toda a lógica de data e referências textuais.

## Alterações

### 1. `src/pages/Index.tsx`

**`getNextThursday8pm()` → data fixa 31/03/2026 às 20h**
- Substituir a lógica dinâmica de "próxima quinta" por uma data fixa: `new Date(2026, 2, 31, 20, 0, 0)` (março = mês 2)

**`useDayCountdown()` → baseado na data fixa 31/03**
- Calcular dias restantes até 31/03 em vez de checar dia da semana
- Domingo (2 dias antes): "Faltam 2 dias", Segunda: "É amanhã!", Terça 31: "É HOJE!"

**Bloco de data no hero (linhas 194-224)**
- Trocar lógica de `daysUntilThursday` para calcular em relação a 31/03/2026
- Exibir "Terça-feira dia 31/03/26 às 20h" em vez de "Quinta-feira"
- `isToday` = dia 31/03, `isTomorrow` = dia 30/03

**Barra de countdown (linhas 247-251)**
- Labels: "Domingo" → "Segunda" → "Terça 20h" (em vez de Terça/Quarta/Quinta)

**Barra fixa inferior (linha 296)**
- "Terça-feira às 20h · Online ao vivo"

### 2. `src/components/BelowFoldSections.tsx`

- FAQ (linha 37): "Quinta-feira às 20h" → "Terça-feira dia 31/03 às 20h"
- CTA final (linha 850): "Quinta-feira às 20h" → "Terça-feira às 20h"

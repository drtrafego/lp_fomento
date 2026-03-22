

## Reformular Header e Contagem Regressiva com Gatilhos Dinâmicos

### Mudanças

**1. Atualizar `useDayCountdown()` (linhas 257-263)**

Expandir para cobrir todos os dias da semana com lógica de "faltam X dias":
- **Sexta (5)**: "Faltam 6 dias" 
- **Sábado (6)**: "Faltam 5 dias"
- **Domingo (0)**: "Faltam 4 dias"
- **Segunda (1)**: "Faltam 3 dias"
- **Terça (2)**: "Faltam 2 dias"
- **Quarta (3)**: "Amanhã, Quinta-feira às 20h"
- **Quinta (4)**: "HOJE, Quinta-feira às 20h" — com flag `isToday: true` para ativar urgência

Sempre retorna `show: true`.

**2. Atualizar texto do header sticky (linhas 678-680)**

Trocar texto fixo "AO VIVO no ZOOM · Quinta-feira 20h" por texto dinâmico:
- `AO VIVO 100% ONLINE · {dayCountdown.label}`

**3. Atualizar seção hero (linhas 703-708)**

Trocar badge "AO VIVO" + texto fixo por:
- Badge "AO VIVO 100% ONLINE"
- Texto dinâmico com a label do countdown

**4. Visual de urgência quando `isToday === true`**

Quando for quinta-feira:
- Header ganha borda pulsante dourada/vermelha
- Badge "HOJE" com fundo vermelho pulsante
- Texto "HOJE" em verde/vermelho com animação
- Glow sutil no header

**5. Atualizar barra de progresso no hero (linhas 711-728)**

Mostrar sempre (não só Ter/Qua/Qui). Progress dinâmico baseado na proximidade:
- 6 dias: ~15%
- 5 dias: ~30%
- 4 dias: ~45%
- 3 dias: ~60%
- 2 dias: ~75%
- Amanhã: ~90%
- Hoje: 100% com cor verde

**6. Atualizar textos no footer/oferta (linhas 1116, 1126)**

Mesmo padrão dinâmico usando `dayCountdown.label`.

### Resultado
- Contagem "faltam X dias" aparece todos os dias da semana
- Quarta mostra "Amanhã" com urgência moderada
- Quinta mostra "HOJE" com animação pulsante vermelha/dourada — máximo gatilho de urgência
- Texto "AO VIVO 100% ONLINE" em vez de "AO VIVO no ZOOM"


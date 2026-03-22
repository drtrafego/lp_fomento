

## Texto Dinâmico do Evento + Logo Zoom com Máscara

### Lógica de data

Calcular a próxima quinta-feira e exibir texto contextual:
- **Quinta-feira**: "🔴 HOJE · Quinta-feira às 20h" com animação de urgência + "Últimas Vagas"
- **Quarta-feira**: "Amanhã · Quinta-feira dia DD/MM/26 às 20h"
- **Outros dias**: "Quinta-feira dia DD/MM/26 às 20h"

### Mudanças em `src/pages/Index.tsx`

1. **Adicionar função helper** que calcula a próxima quinta-feira e retorna `{ dateStr, isToday, isTomorrow }` baseado no dia da semana atual (`new Date().getDay()`)

2. **Copiar a nova logo do Zoom** (`user-uploads://download-round-blue-zoom-logo-icon-png-...removebg-preview.png`) para `src/assets/zoom-icon.png` (substituir a atual) — esta tem fundo transparente, melhor para máscara redonda

3. **Substituir o bloco estático** (linhas 756-762) por lógica dinâmica:
   - Se **hoje é quinta**: texto "HOJE · Quinta-feira às 20h" com bg vermelho pulsante, badge "ÚLTIMAS VAGAS" animado
   - Se **amanhã é quinta**: "Amanhã · Quinta-feira dia DD/MM/26 às 20h"  
   - Caso contrário: "Quinta-feira dia DD/MM/26 às 20h"
   - Logo do Zoom com `w-5 h-5 rounded-full object-cover` (máscara circular)

4. **Estilo de urgência** (quinta-feira): container com `border border-red-500/50 bg-red-500/10 animate-pulse` e badge "ÚLTIMAS VAGAS" em vermelho

### Resultado
- Texto muda automaticamente conforme o dia da semana
- Quinta-feira gera senso de urgência visual
- Logo do Zoom aparece redonda ao lado do texto


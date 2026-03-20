

## Redesign da Seção "O que você vai aprender" — Cards com Numeração, Setas e Bullet Points

### Objetivo
Transformar a seção 5 em um layout com numeração grande (01, 02, 03), bullet points detalhados em cada card, setas animadas entre os cards e efeitos scroll-reveal surpreendentes.

### Layout proposto

```text
       O que você vai aprender neste Workshop

  ┌─ 01 ──────────┐    →    ┌─ 02 ──────────┐    →    ┌─ 03 ──────────┐
  │  ⚡ Estar Apto │  seta   │  → Passo a    │  seta   │  👥 Onde      │
  │               │ animada │    Passo       │ animada │    Encontrar  │
  │ • Bullet 1    │         │ • Bullet 1     │         │ • Bullet 1    │
  │ • Bullet 2    │         │ • Bullet 2     │         │ • Bullet 2    │
  │ • Bullet 3    │         │ • Bullet 3     │         │ • Bullet 3    │
  └───────────────┘         └────────────────┘         └───────────────┘
```

Mobile: cards empilham verticalmente, setas apontam para baixo entre eles.

### Dados dos cards

Cada card ganha 3 bullet points detalhados conforme o conteúdo fornecido pelo usuário (elegibilidade, método prático, acesso a editais).

### Efeitos visuais

1. **Numeração grande**: "01", "02", "03" em tamanho enorme (`text-6xl`), semi-transparente dourado, posicionada no canto superior esquerdo de cada card
2. **Staggered scroll-reveal**: Cada card aparece com delay (0ms, 200ms, 400ms) usando IntersectionObserver — fade-in + slide-up
3. **Setas animadas entre cards**: SVG inline com `stroke-dasharray` + `stroke-dashoffset` animado ao aparecer. Desktop: setas horizontais. Mobile: setas verticais
4. **Glow pulse no hover**: Cards ganham `box-shadow` dourado pulsante ao hover
5. **Bullet points com check dourado**: Cada bullet usa ícone `CheckCircle` dourado

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Redesign seção 5: numeração, bullets detalhados, setas animadas, IntersectionObserver |
| `src/index.css` | Adicionar `@keyframes draw-arrow` para animação stroke das setas |




## Plano Atualizado — Seção de Prova Social com Vídeos

A página ainda não foi implementada (Index.tsx é placeholder). Vou construir **toda a landing page** conforme plano aprovado, agora com a seção de prova social atualizada para **6 vídeos de depoimentos**.

### Mudança na Seção de Prova Social (Seção 8)

Em vez de apenas prints de WhatsApp, teremos um **grid de 6 cards de vídeo** com:
- Espaço para embed de vídeo (placeholder com ícone de play até os vídeos serem fornecidos)
- **@ do Instagram** abaixo de cada vídeo
- **Valor captado** em destaque dourado (ex: "R$ 180.000")
- Layout: 3 colunas desktop, 2 colunas tablet, 1 coluna mobile

### Estrutura completa da página (12 seções)

1. Sticky header com countdown
2. Hero — headline R$39mil–R$400mil + CTA R$47
3. "Não é Empréstimo" — copy + decreto-lei
4. 42+ Programas de Fomento — mapa + badges órgãos
5. O que você vai aprender — 3 cards
6. Bônus — Lista TOP 10 + WhatsApp + Masterclass
7. Quem são Pedro e Igor — bio + foto
8. **Prova Social — 6 cards de vídeo com @instagram + valor captado** (ATUALIZADO)
9. Garantia 30 dias — selo + copy
10. Oferta/Pricing — resumo + R$47
11. FAQ — accordion
12. Footer CTA

### Arquivos

| Ação | Arquivo |
|------|---------|
| Reescrever | `src/pages/Index.tsx` — landing page completa, todas as seções inline |
| Editar | `src/index.css` — animações shimmer, fade-in, counter |
| Limpar | `src/App.css` — remover estilos default |

### Card de vídeo (estrutura de cada um dos 6)

```text
┌─────────────────────┐
│                     │
│   ▶ (play icon)     │  ← placeholder para vídeo
│                     │
├─────────────────────┤
│ @instagram_handle   │
│ R$ XXX.XXX          │  ← valor em dourado
└─────────────────────┘
```

Os dados (@ e valor) ficarão em um array editável no código para fácil atualização quando os vídeos forem fornecidos.


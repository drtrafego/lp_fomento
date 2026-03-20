

## Redesign do Card de Preço + Barra Fixa com Efeito Vidro Jateado

### 1. Card de Preço — Layout Split (2 colunas)

Inspirado nas referências enviadas (IsolaDay, Laboratório do SIM):

```text
┌──────────────────────────────────────────────────────────┐
│               WORKSHOP DO ZERO AO MILHÃO                 │
├────────────────────────┬─────────────────────────────────┤
│                        │       VAGAS LIMITADAS           │
│  ✓ Workshop 1h Zoom    │                                 │
│  ✓ Masterclass         │    De R$ 97,00  (riscado)       │
│  ✓ Lista TOP 10        │    POR                          │
│  ✓ Grupo WhatsApp      │    R$ 47,00  (grande, dourado)  │
│  ✓ Garantia 30 dias    │                                 │
│                        │  [GARANTIR MINHA VAGA AGORA]    │
│ (selo garantia 30d)    │  Visa Mastercard Elo Amex       │
│                        │                                 │
└────────────────────────┴─────────────────────────────────┘
```

- Lado esquerdo: lista de itens + selo de garantia de 30 dias (imagem já no projeto)
- Lado direito: preço "De R$ 97" riscado → "R$ 47,00" destaque + botão CTA + ícones de bandeiras de cartão (SVG inline)
- Título "Workshop Do Zero ao Milhão" no topo do card
- Mobile: empilha verticalmente

### 2. Barra Fixa Inferior — Efeito Vidro Jateado

Substituir o mobile-only floating CTA por uma barra fixa **para todos os tamanhos** com efeito frosted glass:

```text
┌─────────────────────────────────────────────────────────────┐
│  ⏰ Quinta às 20h · Online ao vivo    [QUERO MEU INGRESSO]  │
│            100% online e ao vivo                            │
└─────────────────────────────────────────────────────────────┘
```

- `backdrop-blur-xl` + `bg-[#0a1628]/60` para efeito vidro jateado/areia
- Borda superior sutil dourada
- Botão dourado com shimmer
- Fixa no bottom da tela (`fixed bottom-0`)

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Redesign seção pricing (split layout), substituir floating CTA mobile por barra fixa desktop+mobile com glassmorphism |

### Bandeiras de Cartão

Ícones inline SVG simplificados para Visa, Mastercard, Elo e American Express em tons cinza/branco abaixo do botão.


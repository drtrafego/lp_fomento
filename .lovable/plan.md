

# Adicionar barra de lote promocional abaixo do botão de compra

## O que será feito

Adicionar uma barra de progresso animada logo abaixo do botão "GARANTIR MINHA VAGA AGORA" (linha 771), mostrando que o lote promocional está quase esgotado (98%). A barra exibe dinamicamente as datas de anteontem, ontem e hoje, fazendo parecer que hoje é o último dia do lote.

## Alterações em `src/components/BelowFoldSections.tsx`

### Inserir bloco entre o GoldButton (linha 771) e as bandeiras de pagamento (linha 772)

- **Texto superior**: "🔥 Ingressos vendidos à R$29,00" com "98%" à direita, ambos em texto pequeno
- **Barra de progresso**: Fundo escuro com gradiente animado verde (`#22c55e` → `#4ade80`), preenchida em 98%, com animação CSS de shimmer/pulse
- **Texto inferior**: "Restam poucas vagas — garanta a sua!" em verde claro, texto pequeno
- **Datas dinâmicas**: Três marcadores abaixo da barra mostrando anteontem, ontem e "Hoje (último dia)" — calculados com `new Date()` para sempre serem relativos ao dia atual
- **Animação**: Gradiente da barra com `background-size: 200%` e `animation` CSS para efeito de brilho contínuo movendo da esquerda para direita

### Estilo inline para animação do gradiente

Usar `style` com `backgroundSize: '200% 100%'` e `animation: 'shimmer-bar 2s linear infinite'` — definir o keyframe inline ou via classe Tailwind `animate-` existente.

### Resultado visual

```text
┌──────────────────────────────────┐
│  🔥 Ingressos vendidos à R$29    98% │
│  ████████████████████████████░░  │
│  Restam poucas vagas — garanta!  │
│  25/03  ·  26/03  ·  27/03 ★    │
└──────────────────────────────────┘
```


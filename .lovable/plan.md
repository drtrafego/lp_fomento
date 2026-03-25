

# Plano de Otimização de Performance — PageSpeed 79 → 90+

## Resultado Atual do PageSpeed (Mobile)

| Metrica | Valor | Status |
|---------|-------|--------|
| Performance | **79** | Laranja |
| FCP | 1.9s | Laranja |
| LCP | **4.5s** | Vermelho |
| TBT | 30ms | Verde |
| CLS | 0.017 | Verde |
| Speed Index | 5.3s | Laranja |

## Problema Principal: LCP de 4.5s

O LCP element e o botao "QUERO MEU INGRESSO" (fixed bottom bar). O breakdown mostra:
- TTFB: 0ms (otimo)
- **Element render delay: 2,530ms** (problema critico)

A cadeia critica e: `index.html` → `index.js` (765ms) → `ipapi.co` (1015ms) → `get-user-location` (1270ms) → `meta-pixel-event` (1911ms). Toda essa cadeia bloqueia o render.

## Mudancas Planejadas

### 1. `index.html` — Adiar FB Pixel + Remover preconnect morto

- Trocar o script sincrono do fbevents.js por versao que carrega apos 2.5s via `setTimeout`. O stub `fbq()` fica disponivel imediatamente (enfileira chamadas), mas o download de 98 KiB so acontece depois do hero pintado.
- Remover `<link rel="preconnect" href="https://dunas.b-cdn.net">` e `dns-prefetch` para dunas (flaggeado como "unused preconnect").
- Manter `dns-prefetch` para ipapi.co.

### 2. `src/pages/Index.tsx` — ipapi.co lazy

- Envolver o fetch de `ipapi.co/json/` dentro de `requestIdleCallback` (fallback: `setTimeout 3s`) no hook `useUserState`. Isso tira a chamada do caminho critico. O estado/UF so e usado no BelowFoldSections (abaixo da dobra), entao nao afeta o hero.
- Adicionar `width={224} height={224}` na hero img mobile e `width={448} height={448}` no desktop.

### 3. `src/index.css` — Shimmer com `transform` (corrigir CLS + non-composited)

O PageSpeed flaggeou 7 instancias de "Unsupported CSS Property: left" na animacao shimmer e 3 de "box-shadow" no pulse-glow. Mudancas:

```text
shimmer ::after  →  usar transform: translateX() em vez de left
pulse-glow       →  usar filter: drop-shadow() com will-change: filter
```

### 4. `src/components/BelowFoldSections.tsx` — width/height nas 5 imagens

Adicionar atributos `width` e `height` nas imagens flaggeadas:

| Imagem | width | height |
|--------|-------|--------|
| mapaOrgaos | 1000 | 684 |
| seloGarantia | 224 | 224 |
| pedroIgorImg | 288 | 288 |
| reuniaoFomento | 768 | 277 |
| leiDecreto | 768 | 273 |

### 5. `src/hooks/useMetaPixel.ts` — Location fetch nao bloquear render

Envolver a chamada `supabase.functions.invoke("get-user-location")` em `requestIdleCallback` para que nao entre na cadeia critica do LCP. O Advanced Matching pode ser configurado apos o primeiro paint sem perda de dados (CAPI continua server-side).

## Impacto Esperado

| Metrica | Antes | Depois (est.) |
|---------|-------|---------------|
| LCP | 4.5s | ~2.0-2.5s |
| Speed Index | 5.3s | ~2.5-3.0s |
| CLS | 0.017 | ~0 |
| Performance | 79 | 90+ |
| Connect Rate | 72.1% | >85% |

## Arquivos Modificados

| Arquivo | O que muda |
|---------|------------|
| `index.html` | FB Pixel adiado 2.5s, remover preconnect dunas |
| `src/index.css` | Shimmer com translateX, pulse-glow com filter |
| `src/pages/Index.tsx` | ipapi.co com requestIdleCallback, width/height hero img |
| `src/components/BelowFoldSections.tsx` | width/height nas 5 imagens |
| `src/hooks/useMetaPixel.ts` | get-user-location com requestIdleCallback |


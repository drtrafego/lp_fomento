

# Correções: Contador, Typewriter e Números 01/02/03

## Problemas Identificados

1. **Contador parado em 0**: O `useAnimatedCounter` usa `threshold: 0.3` no IntersectionObserver. Se o elemento não atingir 30% de visibilidade (ou se o scroll já passou), o contador nunca dispara. Precisa reduzir o threshold e permitir re-trigger ao scrollar de volta.

2. **Texto cortado no ScrollTypewriter**: O texto não-revelado usa `text-white/10` + `blur(4px)`, ficando praticamente invisível. Quando o progresso está no meio, o usuário vê fragmentos como "el.", "ia.", "é." — o resto está oculto. Precisa tornar o texto não-revelado mais legível (menos blur, mais opacidade).

3. **Números 01, 02, 03 muito apagados**: Atualmente usam `text-[#d4a853]/15` — quase invisível. Aumentar para `/30` ou `/35`.

## Alterações

### 1. `src/components/BelowFoldSections.tsx`

- **Contador** (`useAnimatedCounter`): Reduzir threshold de `0.3` para `0.1` e resetar `started.current = false` quando o elemento sai da viewport para permitir re-trigger ao scrollar de volta.

- **Números 01/02/03 mobile** (linha ~307): Mudar `text-[#d4a853]/15` para `text-[#d4a853]/30`.

- **Números 01/02/03 desktop** (linha ~269): Mudar `text-[#d4a853]/10` para `text-[#d4a853]/25`.

### 2. `src/components/ScrollTypewriter.tsx`

- **Texto não-revelado**: Mudar de `text-white/10` + `blur(4px)` para `text-white/25` + `blur(2px)` — texto parcialmente visível mas ainda com efeito de revelação.

- **Texto borda de revelação**: Mudar de `text-white/50` + `blur(1px)` para `text-white/60` + sem blur.

Estas alterações garantem que o texto completo dos bullets seja legível mesmo antes de ser "revelado", o contador anime corretamente, e os números de seção fiquem mais visíveis.


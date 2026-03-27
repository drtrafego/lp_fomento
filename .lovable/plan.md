

# Gradiente de urgência na barra de lote (96% → vermelho no final)

## Alteração em `src/components/BelowFoldSections.tsx` (linhas 779-788)

Trocar o gradiente verde uniforme por um gradiente que vai de verde (início) para amarelo (meio) e vermelho/laranja no final (nos últimos ~10%), criando a sensação visual de que está prestes a esgotar.

### Detalhes técnicos

- **Gradiente**: `linear-gradient(90deg, #22c55e 0%, #22c55e 60%, #eab308 80%, #ef4444 95%, #dc2626 100%)`
- Manter o shimmer animado por cima
- Manter `bg-white/15` no fundo para os 4% restantes continuarem visíveis


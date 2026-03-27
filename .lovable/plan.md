
# Remover foto do Pedro e centralizar cards no desktop

## Alterações em `src/components/BelowFoldSections.tsx`

### 1. Remover a foto do Pedro no desktop (linhas 318-327)
- Deletar o bloco `{/* Right: Pedro photo */}` com a `<div>` sticky e a `<img>` do `pedroZoomCall`

### 2. Centralizar os cards no desktop (linha 280)
- Trocar o grid `md:grid-cols-[1fr_auto]` por layout centralizado
- Usar `max-w-2xl mx-auto` no container dos cards para centralizar horizontalmente
- Simplificar de grid para flex/block column já que não há mais coluna direita

### Resultado
- Layout desktop: 3 cards empilhados e centralizados na página
- Layout mobile: sem alteração



## Mover Seção de Garantia para Depois do Card de Preço

### Mudança

Mover a seção 9 (Garantia, linhas 1001-1025) para depois da seção 10 (Oferta/Pricing, linhas 1027-1097). A garantia passará a aparecer abaixo do card de preço.

### Implementação em `src/pages/Index.tsx`

1. **Recortar** o bloco inteiro da seção 9 (linhas 1001-1025) — o `{/* ─── 9. GARANTIA ─── */}` com seu `<Section>` completo

2. **Colar** logo após o fechamento da seção 10 (após linha 1097), renumerando os comentários:
   - Seção de Pricing passa a ser 9
   - Seção de Garantia passa a ser 10

### Resultado
- A garantia aparece logo abaixo do card de preço, reforçando confiança após ver o valor
- Nenhuma alteração visual no conteúdo, apenas reordenação


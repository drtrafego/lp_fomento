

## Mover Seção de Bônus entre Pricing e Garantia

### Mudança

Mover a seção 6 (Bônus, linhas 946-955) da posição atual (antes da Prova Social) para entre a seção 9 (Oferta/Pricing, termina na linha 1071) e a seção 10 (Garantia, começa na linha 1073).

### Implementação em `src/pages/Index.tsx`

1. **Remover** as linhas 946-955 (o bloco `{/* ─── 6. BÔNUS ─── */}` com a `<section>` e `<BonusSection />`)

2. **Inserir** o mesmo bloco entre o fechamento da seção Pricing (linha 1071) e o início da seção Garantia (linha 1073)

### Resultado
- Ordem: Pricing → Bônus → Garantia
- O usuário vê o preço, depois os bônus gratuitos reforçando o valor, e por fim a garantia




# Botão da barra fixa → scroll para provas sociais

## Alterações

### 1. `src/components/BelowFoldSections.tsx`
- Adicionar `id="resultados-reais"` na `<Section>` que contém "Resultados reais" / VideoTestimonials (linha ~664)

### 2. `src/pages/Index.tsx`
- Alterar o botão da barra fixa: em vez de `onClick={handleCheckoutClick}`, usar `scrollIntoView` para o elemento `#resultados-reais` com `behavior: 'smooth'`
- Texto do botão pode ser mantido ou ajustado conforme preferir


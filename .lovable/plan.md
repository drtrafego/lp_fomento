

# Reativar botão de compra na Hero

## Alteração em `src/pages/Index.tsx` (linhas 256-261)

Descomentar o `GoldButton` que já existe, removendo o bloco de comentário `{/* ... */}` ao redor dele. O botão já chama `handleCheckoutClick` que redireciona para o checkout da Zouti com UTMs.

```jsx
// Remover comentário, deixando:
<GoldButton className="w-full sm:w-auto" onClick={handleCheckoutClick}>
  GARANTIR MINHA VAGA
  <ArrowRight className="inline ml-2" size={18} />
</GoldButton>
```

Nenhum outro arquivo precisa ser alterado — o `GoldButton` já inclui o selo "Garantia de 30 dias · Compra segura" automaticamente.




## Plano: Criar rota /27 como cópia da landing page

### O que será feito

Adicionar uma rota `/27` no React Router que renderiza o mesmo componente `Index` da página principal. Isso permite testar o "ticket 27" acessando `workshop-fomento.lovable.app/27` ou `workshop-aovivo-fomento.com.br/27`.

### Alteração

**`src/App.tsx`**
- Adicionar uma nova `<Route path="/27" element={<Index />} />` antes da rota catch-all `*`

Nenhuma outra alteração necessária — a mesma página será servida em ambas as rotas (`/` e `/27`), funcionando em mobile, tablet e desktop.


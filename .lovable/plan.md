

## Plano: Ticket 27 — Trocar preço para R$ 27,00 e link de checkout

### Resumo
Transformar a rota `/27` numa variação da landing page com preço R$ 27,00 (em vez de R$ 37,00) e link de checkout diferente, propagando UTMs.

### Alterações

**1. `src/lib/metaPixelUtils.ts`**
- Criar nova função `buildCheckoutUrl27()` que usa a base `https://pay.zouti.com.br/checkout?poi=prod_offer_70nyutmszj3bzeqq86zvf4` e propaga UTMs + `src` da mesma forma que `buildCheckoutUrl()`

**2. `src/pages/Index.tsx`**
- Detectar se a rota atual é `/27` (via `useLocation()`)
- Quando for `/27`:
  - `handleCheckoutClick` usa `buildCheckoutUrl27()` em vez de `buildCheckoutUrl()`
  - Trocar todos os textos de "R$ 37,00" e "R$37" para "R$ 27,00" / "R$27" na Hero (botões CTA, barra de escassez)
- Passar props `ticketPrice="27"` e o handler correto para `BelowFoldSections`

**3. `src/components/BelowFoldSections.tsx`**
- Receber nova prop `ticketPrice` (default `"37"`)
- Substituir todas as referências hardcoded de "37" pelo valor dinâmico:
  - Preço grande na seção de oferta: `37` → `{ticketPrice}`
  - Textos "R$37" na barra de escassez → `R${ticketPrice}`
  - Botão CTA "R$ 37,00" → `R$ {ticketPrice},00`

### O que não muda
- Textos de captação (39 a 400 mil, garantia, etc.) permanecem iguais
- Rota `/` continua com R$ 37,00 e checkout original
- UTMs são propagados igualmente em ambas as rotas


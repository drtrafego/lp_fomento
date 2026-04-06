

## Plano: Remover eventos InitiateCheckout e Purchase do Lovable

Como esses eventos já são disparados pela Zouti no checkout, precisamos removê-los do código do Lovable para evitar duplicidade.

### Alterações

**1. `supabase/functions/meta-pixel-event/index.ts`**
- Remover `"Purchase"` da lista `VALID_EVENTS` (linha 10), ficando apenas `["PageView", "ViewContent"]`
- Isso faz com que qualquer tentativa de enviar Purchase por essa Edge Function retorne erro 400

**2. `supabase/functions/checkout-webhook/index.ts`**
- Remover todo o bloco de disparo Meta CAPI para Purchase (linhas ~136-195) — o webhook continua salvando os dados no banco, mas não dispara mais o evento para a Meta (a Zouti já faz isso)

**3. `src/hooks/useMetaPixel.ts`**
- Remover a função `trackPurchase` e o método `sendEvent("Purchase", ...)` 
- Remover `trackPurchase` do retorno do hook
- O hook passa a exportar apenas `{ trackPageView, trackViewContent }`

**4. Deploy** das duas Edge Functions após as alterações

### O que permanece
- `PageView` e `ViewContent` continuam sendo disparados pelo Lovable (browser + servidor CAPI)
- O webhook continua salvando eventos de checkout no banco (`checkout_events`) para o dashboard
- InitiateCheckout e Purchase ficam 100% sob responsabilidade da Zouti


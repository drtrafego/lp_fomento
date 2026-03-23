

## Corrigir Valor do Produto e Parâmetros Dinâmicos no Meta Pixel

### Problema
O `handleCheckoutClick` está enviando `value: 97.00` hardcoded, mas o preço real na página é **R$ 47,00** (De R$ 97 por R$ 47). Além disso, parâmetros como IP, cidade, estado, país, fbp, fbc, etc. já são dinâmicos — o problema é apenas o valor do produto.

### Correção em `src/pages/Index.tsx`

Alterar o `handleCheckoutClick` (linha 687-695):

**De:**
```typescript
trackInitiateCheckout({}, {
  content_ids: ["workshop-captacao"],
  content_name: "Workshop Do Zero à Captação",
  value: 97.00,
  currency: "BRL",
});
```

**Para:**
```typescript
trackInitiateCheckout({}, {
  content_ids: ["workshop-captacao"],
  content_name: "Workshop Do Zero à Captação",
  value: 47.00,
  currency: "BRL",
});
```

### Nota sobre os outros parâmetros
Os seguintes parâmetros **já são capturados dinamicamente** por visitante:
- **IP** → capturado no edge function via `x-forwarded-for`
- **Cidade, Estado, País, ZIP** → via edge function `get-user-location` (ip-api.com)
- **fbp** → lido do cookie `_fbp` (setado pelo Meta Pixel)
- **fbc** → lido do cookie `_fbc` ou gerado a partir do `fbclid` na URL
- **fbclid** → capturado da URL de entrada
- **user_agent** → `navigator.userAgent`
- **external_id** → UUID persistente no localStorage
- **UTMs** → capturados da URL e persistidos no localStorage
- **Hashes (em, ph, fn, ln, ct, st, zp, country)** → gerados no edge function a partir dos dados de localização

Todos esses valores variam de visitante para visitante automaticamente. A única coisa hardcoded incorretamente era o valor do produto.




## Plano: Alinhar implementação CAPI com a documentação oficial da Meta

### Auditoria realizada

Comparei a implementação atual com a documentação oficial da Meta Conversions API (Server Event Parameters + Customer Information Parameters). Encontrei os seguintes problemas:

---

### Problemas encontrados

**1. Versão da Graph API desatualizada**
- Ambas as Edge Functions usam `v21.0`. A versão atual recomendada é `v22.0`.
- Arquivo: `meta-pixel-event/index.ts` (linha 124) e `checkout-webhook/index.ts` (linha 170)

**2. `external_id` não deve ser enviado como array (mas como string ou array de strings)**
- Segundo a doc, `external_id` aceita `string or list<string>`. Atualmente enviamos como string simples hasheada, o que está correto. Porém, para consistência com `em`, `ph`, etc., deveria ser `[hashed_external_id]` (array).
- Arquivo: `meta-pixel-event/index.ts` (linha 90)

**3. `event_source_url` é obrigatório para website events**
- A doc diz: "The `event_source_url` is required for website events shared using the Conversions API." Já está sendo enviado corretamente.

**4. `fbp` e `fbc` — formato não validado**
- A doc especifica formatos: `fb.${subdomain_index}.${creation_time}.${fbclid}` para fbc e `fb.${subdomain_index}.${creation_time}.${random_number}` para fbp. Não há validação de formato antes de enviar.
- Arquivo: `meta-pixel-event/index.ts` e `useMetaPixel.ts`

**5. Campos de `user_data` no checkout-webhook incompletos**
- O Purchase via webhook não envia `fn` (first_name) e `ln` (last_name) mesmo quando disponíveis no `customer.name`. Segundo a doc, enviar mais parâmetros de customer info melhora o Event Match Quality.
- Arquivo: `checkout-webhook/index.ts`

**6. `country` não enviado no checkout-webhook Purchase**
- O webhook de Purchase não envia country no `user_data`, mas o dado pode estar disponível no payload da Zouti.

---

### Alterações propostas

**1. `supabase/functions/meta-pixel-event/index.ts`**
- Atualizar Graph API de `v21.0` para `v22.0`
- Mudar `external_id` de string para array: `user_data.external_id = [hashed_external_id]`
- Adicionar validação de formato para `fbp` (deve começar com `fb.`) e `fbc` (deve começar com `fb.`)

**2. `supabase/functions/checkout-webhook/index.ts`**
- Atualizar Graph API de `v21.0` para `v22.0`
- Extrair `first_name` e `last_name` do `customer.name` (split pelo primeiro espaço), hashear e incluir como `fn` e `ln` no `user_data`
- Incluir `country` no `user_data` se disponível no payload Zouti (tipicamente `customer.address.country`)
- Incluir `external_id` hasheado se disponível (ex: `customer.id` ou `order_id`)

**3. `src/lib/metaPixelUtils.ts`**
- Na função `getFbCookies`, validar formato do `fbp` (deve começar com `fb.`) e `fbc` (deve começar com `fb.`) antes de retornar — retornar string vazia se formato inválido

**4. Deploy** das duas Edge Functions após as alterações

---

### Resumo do que já está correto

- Hashing SHA-256 dos campos PII (em, ph, fn, ln, ct, st, zp, country)
- `client_ip_address` e `client_user_agent` enviados sem hash
- `fbp` e `fbc` enviados sem hash
- `event_id` para deduplicação browser/servidor
- `action_source: "website"`
- `event_time` em Unix timestamp (segundos)
- Campos vazios omitidos do payload (corrigido na iteração anterior)


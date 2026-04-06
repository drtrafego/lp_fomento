

## Plano: Corrigir PageView/ViewContent CAPI e remover InitiateCheckout do Lovable

### Diagnóstico

Analisei os dados e encontrei os seguintes problemas:

1. **PageView (6.7/10)**: O CAPI funciona, mas `fbp` e `fbc` estão sendo enviados como strings vazias (`""`) em vez de serem omitidos. O Meta interpreta isso como "parâmetro presente mas vazio", o que prejudica a nota.

2. **ViewContent**: Apenas 8 eventos no servidor, o último em 1 de abril. O tracking via CAPI parou de funcionar — provavelmente porque os eventos estão sendo enviados com strings vazias nos campos opcionais, causando problemas de qualidade.

3. **InitiateCheckout**: Está sendo disparado pelo webhook do Lovable E pela Zouti, causando duplicidade. Precisa ser removido do Lovable.

---

### Alterações

**1. `src/hooks/useMetaPixel.ts`** — Corrigir envio de campos vazios

- Na função `firePageViewIfReady` (PageView) e `sendEvent` (ViewContent etc.), trocar todos os campos que enviam `""` por `undefined` quando vazios: `fbp`, `fbc`, `country`, `state`, `city`, `zip_code`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`
- Isso faz com que campos sem valor sejam omitidos do payload, em vez de enviados como string vazia
- Usar pattern: `fbp || undefined` em vez de `fbp`; `location.country || undefined` em vez de `location.country || ""`

**2. `supabase/functions/meta-pixel-event/index.ts`** — Limpar dados antes de enviar ao Meta

- Remover `"InitiateCheckout"` do array `VALID_EVENTS`
- No `user_data` do payload Meta CAPI, garantir que campos vazios/null não sejam incluídos (já está correto com os `if` checks, mas o `fbp` e `fbc` vazios passam)
- Adicionar validação: só incluir `fbp`/`fbc` se forem strings não-vazias

**3. `supabase/functions/checkout-webhook/index.ts`** — Remover bloco de InitiateCheckout CAPI

- Remover completamente o bloco que dispara `InitiateCheckout` via Meta CAPI (linhas ~110-160), já que a Zouti cuida desse evento
- Manter o tracking de `Purchase` via CAPI (esse continua)

**4. Deploy** das duas edge functions após as alterações


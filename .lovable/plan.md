

## Simplificar ViewContent e Esclarecer Pixel Helper

### 1. Reduzir ViewContent para 2 eventos

Atualmente existem 3 `useSectionTracking` (Hero, Autoridade, Oferta). Vamos reduzir para 2:

- **Meio da página**: "Autoridade" (seção de credibilidade/prova social)
- **Final da página**: "Oferta" (seção de preço/CTA final)

Remover o tracking do "Hero" — o PageView já cobre a chegada na página.

**Arquivo**: `src/pages/Index.tsx` (linhas 677-679)
- Remover `heroRef` e sua referência no JSX
- Manter `autoridadeRef` e `ofertaRef`

### 2. Sobre o Pixel Helper

O **Pixel Helper** mostra APENAS o que o `fbq()` do browser envia:
- `event_name` (PageView, ViewContent, InitiateCheckout)
- `eventID` (para deduplicação)
- `custom_data` (content_name, value, currency)
- Advanced Matching (`country`, `ct`, `st`, `zp`, `external_id`)

Os seguintes dados **NÃO aparecem no Pixel Helper** porque são enviados pelo servidor (CAPI):
- `client_ip` — capturado no edge function
- `user_agent` — enviado via CAPI
- `page_url`, `page_title`, `referrer` — enviados via CAPI
- `created_at` — gerado no banco de dados
- UTMs — enviados via CAPI e salvos no banco
- Hashes (em, ph, fn, ln) — gerados no servidor

Para ver esses dados, acesse o **Events Manager** do Meta (aba "Test Events") ou consulte a tabela `pixel_events` no banco de dados.

Nenhuma mudança técnica é necessária para isso — o sistema já envia tudo corretamente via servidor.


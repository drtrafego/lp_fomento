

## Plano: Atualizar credenciais Meta Pixel

Os segredos `META_PIXEL_ID` e `META_ACCESS_TOKEN` já existem no projeto. Vou usar a ferramenta de adicionar segredos para solicitar os novos valores ao usuário.

### Passos

1. Solicitar ao usuário o novo valor de `META_PIXEL_ID`
2. Solicitar ao usuário o novo valor de `META_ACCESS_TOKEN`
3. Após inseridos, as Edge Functions (`meta-pixel-event` e `checkout-webhook`) passarão a usar automaticamente os novos valores

Nenhuma alteração de código é necessária — apenas a atualização dos segredos.


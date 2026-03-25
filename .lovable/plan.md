

# Corrigir RLS da tabela page_analytics

## Problema

A tabela `page_analytics` tem policy de INSERT apenas para `anon`, mas no preview do Lovable o usuario esta autenticado (role `authenticated`). O Supabase client envia o JWT do usuario autenticado, resultando em 403.

## Solucao

Criar uma migration adicionando policy de INSERT para `authenticated`:

```sql
CREATE POLICY "authenticated_insert" ON public.page_analytics
FOR INSERT TO authenticated
WITH CHECK (true);
```

Isso resolve o erro sem alterar nenhum codigo — apenas a permissao no banco.

## Arquivo

| Arquivo | Mudanca |
|---------|---------|
| Migration SQL | Adicionar policy `authenticated_insert` na tabela `page_analytics` |


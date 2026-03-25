CREATE POLICY "authenticated_insert" ON public.page_analytics
FOR INSERT TO authenticated
WITH CHECK (true);

DELETE FROM public.checkout_events
WHERE id NOT IN (
  SELECT DISTINCT ON (order_id, event_type) id
  FROM public.checkout_events
  WHERE order_id IS NOT NULL
  ORDER BY order_id, event_type, created_at ASC
)
AND order_id IS NOT NULL;

CREATE UNIQUE INDEX idx_checkout_events_order_event ON public.checkout_events (order_id, event_type) WHERE order_id IS NOT NULL;

REVOKE EXECUTE ON FUNCTION public.upsert_push_subscription(text,text,text,text[],boolean,boolean) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.delete_push_subscription(text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.upsert_push_subscription(text,text,text,text[],boolean,boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_push_subscription(text) TO service_role;

-- Tablas internas del bot: ningún usuario final debe acceder.
create policy "deny all" on public.telegram_users for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.telegram_subscriptions for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.telegram_reminders for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.telegram_processed_updates for all to anon, authenticated using (false) with check (false);

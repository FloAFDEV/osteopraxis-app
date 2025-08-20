-- Programmer le nettoyage automatique toutes les 10 minutes
SELECT cron.schedule(
  'demo-cleanup-every-10-minutes',
  '*/10 * * * *', -- toutes les 10 minutes
  $$
  SELECT net.http_post(
      url := 'https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/demo-cleanup',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwanV2enBxZmlyeW10anduaWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2Mzg4MjIsImV4cCI6MjA0NDIxNDgyMn0.VUmqO5zkRxr1Xucv556GStwCabvZrRckzIzXVPgAthQ"}'::jsonb,
      body := '{"source": "scheduled_cleanup"}'::jsonb
  ) as request_id;
  $$
);
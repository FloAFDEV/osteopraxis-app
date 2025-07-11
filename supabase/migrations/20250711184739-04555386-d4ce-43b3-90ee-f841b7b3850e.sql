-- Correction : utiliser le bon nom de colonne
INSERT INTO public.subscription_plans (name, price_monthly, max_patients, max_cabinets, features) VALUES
('Gratuit', 0, 50, 1, '{"invoices": false, "advanced_stats": false, "export": false}'),
('Essentiel', 9, 500, 1, '{"invoices": true, "advanced_stats": false, "export": true}'),
('Pro', 16, 1000, 2, '{"invoices": true, "advanced_stats": true, "export": true}'),
('Premium', 34, 3000, 5, '{"invoices": true, "advanced_stats": true, "export": true, "unlimited_practitioners": true}');
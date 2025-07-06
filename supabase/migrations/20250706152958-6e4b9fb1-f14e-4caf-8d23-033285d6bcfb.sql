-- Migration pour les templates de consultation personnalisables
CREATE TABLE public.consultation_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  content JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  osteopath_id INTEGER NOT NULL,
  cabinet_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_consultation_templates_osteopath 
    FOREIGN KEY (osteopath_id) REFERENCES "Osteopath"(id) ON DELETE CASCADE,
  CONSTRAINT fk_consultation_templates_cabinet 
    FOREIGN KEY (cabinet_id) REFERENCES "Cabinet"(id) ON DELETE SET NULL
);

-- Migration pour les récurrences de rendez-vous
CREATE TABLE public.recurring_appointments (
  id SERIAL PRIMARY KEY,
  osteopath_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  cabinet_id INTEGER,
  reason TEXT NOT NULL,
  notes TEXT,
  duration_minutes INTEGER DEFAULT 60,
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekly', 'biweekly', 'monthly')),
  recurrence_interval INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE,
  max_occurrences INTEGER,
  start_time TIME NOT NULL,
  weekdays INTEGER[] DEFAULT NULL, -- Pour les récurrences hebdomadaires [1,2,3,4,5] = lundi à vendredi
  monthly_day INTEGER, -- Jour du mois pour les récurrences mensuelles
  exceptions DATE[] DEFAULT '{}', -- Dates à exclure
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_recurring_appointments_osteopath 
    FOREIGN KEY (osteopath_id) REFERENCES "Osteopath"(id) ON DELETE CASCADE,
  CONSTRAINT fk_recurring_appointments_patient 
    FOREIGN KEY (patient_id) REFERENCES "Patient"(id) ON DELETE CASCADE,
  CONSTRAINT fk_recurring_appointments_cabinet 
    FOREIGN KEY (cabinet_id) REFERENCES "Cabinet"(id) ON DELETE SET NULL
);

-- Table pour lier les rendez-vous générés aux récurrences
ALTER TABLE public."Appointment" ADD COLUMN recurring_appointment_id INTEGER;
ALTER TABLE public."Appointment" ADD CONSTRAINT fk_appointment_recurring 
  FOREIGN KEY (recurring_appointment_id) REFERENCES recurring_appointments(id) ON DELETE SET NULL;

-- Index pour les performances
CREATE INDEX idx_consultation_templates_osteopath_active ON consultation_templates (osteopath_id, is_active);
CREATE INDEX idx_recurring_appointments_active ON recurring_appointments (is_active, start_date, end_date);
CREATE INDEX idx_recurring_appointments_osteopath ON recurring_appointments (osteopath_id);

-- Fonction pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_consultation_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_recurring_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour les timestamps
CREATE TRIGGER trigger_consultation_templates_updated_at
  BEFORE UPDATE ON consultation_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_templates_updated_at();

CREATE TRIGGER trigger_recurring_appointments_updated_at
  BEFORE UPDATE ON recurring_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_appointments_updated_at();

-- RLS pour consultation_templates
ALTER TABLE consultation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "osteopath_manage_consultation_templates" ON consultation_templates
  FOR ALL USING (
    osteopath_id IN (
      SELECT o.id FROM "Osteopath" o WHERE o."authId" = auth.uid()
    )
  )
  WITH CHECK (
    osteopath_id IN (
      SELECT o.id FROM "Osteopath" o WHERE o."authId" = auth.uid()
    )
  );

-- RLS pour recurring_appointments
ALTER TABLE recurring_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "osteopath_manage_recurring_appointments" ON recurring_appointments
  FOR ALL USING (
    osteopath_id IN (
      SELECT o.id FROM "Osteopath" o WHERE o."authId" = auth.uid()
    )
  )
  WITH CHECK (
    osteopath_id IN (
      SELECT o.id FROM "Osteopath" o WHERE o."authId" = auth.uid()
    )
  );

-- Vue matérialisée pour les analytics avancées
CREATE MATERIALIZED VIEW public.advanced_analytics AS
WITH appointment_stats AS (
  SELECT 
    a."osteopathId",
    DATE_TRUNC('month', a.date::date) as month,
    COUNT(*) as total_appointments,
    COUNT(*) FILTER (WHERE a.status = 'COMPLETED') as completed_appointments,
    COUNT(*) FILTER (WHERE a.status = 'NO_SHOW') as no_show_appointments,
    COUNT(*) FILTER (WHERE a.status = 'CANCELED') as canceled_appointments,
    AVG(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) as completion_rate,
    AVG(CASE WHEN a.status = 'NO_SHOW' THEN 1 ELSE 0 END) as no_show_rate
  FROM "Appointment" a
  WHERE a.date >= CURRENT_DATE - INTERVAL '2 years'
  GROUP BY a."osteopathId", DATE_TRUNC('month', a.date::date)
),
revenue_stats AS (
  SELECT 
    i."osteopathId",
    DATE_TRUNC('month', i.date::date) as month,
    SUM(i.amount) as total_revenue,
    COUNT(*) as total_invoices,
    AVG(i.amount) as avg_invoice_amount,
    COUNT(*) FILTER (WHERE i."paymentStatus" = 'PAID') as paid_invoices,
    SUM(CASE WHEN i."paymentStatus" = 'PAID' THEN i.amount ELSE 0 END) as paid_revenue
  FROM "Invoice" i
  WHERE i.date >= CURRENT_DATE - INTERVAL '2 years'
  GROUP BY i."osteopathId", DATE_TRUNC('month', i.date::date)
),
patient_stats AS (
  SELECT 
    p."osteopathId",
    DATE_TRUNC('month', p."createdAt"::date) as month,
    COUNT(*) as new_patients,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(CURRENT_DATE, p."birthDate"::date)) < 18) as new_children
  FROM "Patient" p
  WHERE p."createdAt" >= CURRENT_DATE - INTERVAL '2 years'
  GROUP BY p."osteopathId", DATE_TRUNC('month', p."createdAt"::date)
)
SELECT 
  COALESCE(a."osteopathId", r."osteopathId", p."osteopathId") as osteopath_id,
  COALESCE(a.month, r.month, p.month) as month,
  COALESCE(a.total_appointments, 0) as total_appointments,
  COALESCE(a.completed_appointments, 0) as completed_appointments,
  COALESCE(a.no_show_appointments, 0) as no_show_appointments,
  COALESCE(a.canceled_appointments, 0) as canceled_appointments,
  COALESCE(a.completion_rate, 0) as completion_rate,
  COALESCE(a.no_show_rate, 0) as no_show_rate,
  COALESCE(r.total_revenue, 0) as total_revenue,
  COALESCE(r.total_invoices, 0) as total_invoices,
  COALESCE(r.avg_invoice_amount, 0) as avg_invoice_amount,
  COALESCE(r.paid_invoices, 0) as paid_invoices,
  COALESCE(r.paid_revenue, 0) as paid_revenue,
  COALESCE(p.new_patients, 0) as new_patients,
  COALESCE(p.new_children, 0) as new_children
FROM appointment_stats a
FULL OUTER JOIN revenue_stats r ON a."osteopathId" = r."osteopathId" AND a.month = r.month
FULL OUTER JOIN patient_stats p ON COALESCE(a."osteopathId", r."osteopathId") = p."osteopathId" 
  AND COALESCE(a.month, r.month) = p.month;

-- Index pour la vue matérialisée
CREATE UNIQUE INDEX idx_advanced_analytics_osteopath_month ON advanced_analytics (osteopath_id, month);

-- Fonction pour actualiser la vue matérialisée
CREATE OR REPLACE FUNCTION refresh_advanced_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY advanced_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS pour la vue matérialisée
ALTER TABLE advanced_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "osteopath_view_analytics" ON advanced_analytics
  FOR SELECT USING (
    osteopath_id IN (
      SELECT o.id FROM "Osteopath" o WHERE o."authId" = auth.uid()
    )
  );
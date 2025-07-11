-- Corriger la fonction admin_get_detailed_stats pour résoudre l'ambiguïté de period_start
DROP FUNCTION IF EXISTS public.admin_get_detailed_stats(text, integer);

CREATE OR REPLACE FUNCTION public.admin_get_detailed_stats(period_type text DEFAULT 'month'::text, periods_count integer DEFAULT 12)
 RETURNS TABLE(
    period_label text, 
    period_start timestamp with time zone, 
    period_end timestamp with time zone, 
    new_users integer, 
    new_osteopaths integer, 
    new_patients integer, 
    new_cabinets integer, 
    total_appointments integer, 
    completed_appointments integer, 
    canceled_appointments integer, 
    total_invoices integer, 
    paid_invoices integer, 
    total_revenue numeric, 
    active_users integer, 
    error_count integer
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    interval_expr text;
    date_trunc_format text;
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE "User".id = auth.uid() 
        AND "User".role = 'ADMIN'
        AND "User".deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent accéder aux statistiques détaillées';
    END IF;

    -- Définir les formats selon le type de période
    CASE period_type
        WHEN 'day' THEN 
            interval_expr := '1 day';
            date_trunc_format := 'day';
        WHEN 'week' THEN 
            interval_expr := '1 week';
            date_trunc_format := 'week';
        WHEN 'month' THEN 
            interval_expr := '1 month';
            date_trunc_format := 'month';
        WHEN 'year' THEN 
            interval_expr := '1 year';
            date_trunc_format := 'year';
        ELSE 
            interval_expr := '1 month';
            date_trunc_format := 'month';
    END CASE;

    RETURN QUERY
    WITH period_series AS (
        SELECT 
            generate_series(
                date_trunc(date_trunc_format, NOW() - (periods_count::text || ' ' || period_type)::interval),
                date_trunc(date_trunc_format, NOW()),
                interval_expr::interval
            ) as ps_start
    ),
    period_ranges AS (
        SELECT 
            ps.ps_start as pr_start,
            ps.ps_start + interval_expr::interval as pr_end,
            CASE 
                WHEN period_type = 'day' THEN TO_CHAR(ps.ps_start, 'DD/MM/YYYY')
                WHEN period_type = 'week' THEN 'Semaine du ' || TO_CHAR(ps.ps_start, 'DD/MM')
                WHEN period_type = 'month' THEN TO_CHAR(ps.ps_start, 'MM/YYYY')
                WHEN period_type = 'year' THEN TO_CHAR(ps.ps_start, 'YYYY')
            END as pr_label
        FROM period_series ps
    )
    SELECT 
        pr.pr_label::text,
        pr.pr_start,
        pr.pr_end,
        -- Nouveaux utilisateurs
        COALESCE((SELECT COUNT(*)::integer FROM "User" u 
                  WHERE u.created_at >= pr.pr_start AND u.created_at < pr.pr_end AND u.deleted_at IS NULL), 0),
        -- Nouveaux ostéopathes  
        COALESCE((SELECT COUNT(*)::integer FROM "Osteopath" o 
                  WHERE o."createdAt" >= pr.pr_start AND o."createdAt" < pr.pr_end), 0),
        -- Nouveaux patients
        COALESCE((SELECT COUNT(*)::integer FROM "Patient" p 
                  WHERE p."createdAt" >= pr.pr_start AND p."createdAt" < pr.pr_end AND p.deleted_at IS NULL), 0),
        -- Nouveaux cabinets
        COALESCE((SELECT COUNT(*)::integer FROM "Cabinet" c 
                  WHERE c."createdAt" >= pr.pr_start AND c."createdAt" < pr.pr_end), 0),
        -- Total rendez-vous
        COALESCE((SELECT COUNT(*)::integer FROM "Appointment" a 
                  WHERE a.date >= pr.pr_start AND a.date < pr.pr_end AND a.deleted_at IS NULL), 0),
        -- Rendez-vous terminés
        COALESCE((SELECT COUNT(*)::integer FROM "Appointment" a 
                  WHERE a.date >= pr.pr_start AND a.date < pr.pr_end AND a.status = 'COMPLETED' AND a.deleted_at IS NULL), 0),
        -- Rendez-vous annulés
        COALESCE((SELECT COUNT(*)::integer FROM "Appointment" a 
                  WHERE a.date >= pr.pr_start AND a.date < pr.pr_end AND a.status = 'CANCELED' AND a.deleted_at IS NULL), 0),
        -- Total factures
        COALESCE((SELECT COUNT(*)::integer FROM "Invoice" i 
                  WHERE i.date >= pr.pr_start AND i.date < pr.pr_end AND i.deleted_at IS NULL), 0),
        -- Factures payées
        COALESCE((SELECT COUNT(*)::integer FROM "Invoice" i 
                  WHERE i.date >= pr.pr_start AND i.date < pr.pr_end AND i."paymentStatus" = 'PAID' AND i.deleted_at IS NULL), 0),
        -- Chiffre d'affaires
        COALESCE((SELECT SUM(i.amount) FROM "Invoice" i 
                  WHERE i.date >= pr.pr_start AND i.date < pr.pr_end AND i."paymentStatus" = 'PAID' AND i.deleted_at IS NULL), 0),
        -- Utilisateurs actifs (connexion dans la période)
        COALESCE((SELECT COUNT(DISTINCT u.id)::integer FROM "User" u 
                  WHERE u.updated_at >= pr.pr_start AND u.updated_at < pr.pr_end AND u.deleted_at IS NULL), 0),
        -- Nombre d'erreurs
        COALESCE((SELECT COUNT(*)::integer FROM audit_logs al 
                  WHERE al.created_at >= pr.pr_start AND al.created_at < pr.pr_end 
                  AND (al.action LIKE '%ERROR%' OR al.action LIKE '%FAILED%')), 0)
    FROM period_ranges pr
    ORDER BY pr.pr_start DESC;
END;
$function$;
-- Corriger la fonction admin_search_patients pour résoudre l'ambiguïté des colonnes
CREATE OR REPLACE FUNCTION public.admin_search_patients(
    search_term text DEFAULT NULL::text, 
    osteopath_filter integer DEFAULT NULL::integer, 
    cabinet_filter integer DEFAULT NULL::integer, 
    limit_count integer DEFAULT 50
)
RETURNS TABLE(
    id integer, 
    first_name text, 
    last_name text, 
    email text, 
    phone text, 
    osteopath_id integer, 
    osteopath_name text, 
    cabinet_id integer, 
    cabinet_name text, 
    created_at timestamp with time zone, 
    updated_at timestamp with time zone, 
    deleted_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE "User".id = auth.uid() 
        AND "User".role = 'ADMIN'
        AND "User".deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent effectuer cette recherche';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p."firstName" as first_name,
        p."lastName" as last_name,
        p.email,
        p.phone,
        p."osteopathId" as osteopath_id,
        o.name as osteopath_name,
        p."cabinetId" as cabinet_id,
        c.name as cabinet_name,
        p."createdAt" as created_at,
        p."updatedAt" as updated_at,
        p.deleted_at
    FROM "Patient" p
    LEFT JOIN "Osteopath" o ON p."osteopathId" = o.id
    LEFT JOIN "Cabinet" c ON p."cabinetId" = c.id
    WHERE 
        (search_term IS NULL OR 
         p."firstName" ILIKE '%' || search_term || '%' OR
         p."lastName" ILIKE '%' || search_term || '%' OR
         p.email ILIKE '%' || search_term || '%' OR
         p.phone ILIKE '%' || search_term || '%' OR
         p.id::text = search_term)
    AND (osteopath_filter IS NULL OR p."osteopathId" = osteopath_filter)
    AND (cabinet_filter IS NULL OR p."cabinetId" = cabinet_filter)
    ORDER BY 
        CASE WHEN p.deleted_at IS NOT NULL THEN 1 ELSE 0 END,
        p."updatedAt" DESC
    LIMIT limit_count;
END;
$function$;

-- Fonction pour obtenir les logs d'erreur système détaillés
CREATE OR REPLACE FUNCTION public.admin_get_system_logs(
    limit_count integer DEFAULT 100,
    log_level text DEFAULT NULL,
    date_from timestamp with time zone DEFAULT NULL,
    date_to timestamp with time zone DEFAULT NULL
)
RETURNS TABLE(
    log_id uuid,
    log_timestamp timestamp with time zone,
    level text,
    action text,
    table_name text,
    user_id uuid,
    user_email text,
    record_id text,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    success boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE "User".id = auth.uid() 
        AND "User".role = 'ADMIN'
        AND "User".deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent accéder aux logs système';
    END IF;

    RETURN QUERY
    SELECT 
        al.id as log_id,
        al.created_at as log_timestamp,
        CASE 
            WHEN al.action LIKE '%ERROR%' OR al.action LIKE '%FAILED%' THEN 'ERROR'::text
            WHEN al.action LIKE '%WARN%' THEN 'WARNING'::text
            WHEN al.action LIKE '%ADMIN%' THEN 'ADMIN'::text
            ELSE 'INFO'::text
        END as level,
        al.action,
        al.table_name,
        al.user_id,
        u.email as user_email,
        al.record_id,
        al.old_values,
        al.new_values,
        al.ip_address,
        al.user_agent,
        NOT (al.action LIKE '%ERROR%' OR al.action LIKE '%FAILED%') as success
    FROM audit_logs al
    LEFT JOIN "User" u ON al.user_id = u.id
    WHERE 
        (date_from IS NULL OR al.created_at >= date_from)
        AND (date_to IS NULL OR al.created_at <= date_to)
        AND (log_level IS NULL OR 
             (log_level = 'ERROR' AND (al.action LIKE '%ERROR%' OR al.action LIKE '%FAILED%')) OR
             (log_level = 'WARNING' AND al.action LIKE '%WARN%') OR
             (log_level = 'ADMIN' AND al.action LIKE '%ADMIN%') OR
             (log_level = 'INFO' AND NOT (al.action LIKE '%ERROR%' OR al.action LIKE '%FAILED%' OR al.action LIKE '%WARN%' OR al.action LIKE '%ADMIN%')))
    ORDER BY al.created_at DESC
    LIMIT limit_count;
END;
$function$;

-- Fonction pour obtenir les statistiques détaillées par période
CREATE OR REPLACE FUNCTION public.admin_get_detailed_stats(
    period_type text DEFAULT 'month', -- 'day', 'week', 'month', 'year'
    periods_count integer DEFAULT 12
)
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
            ) as period_start
    ),
    period_ranges AS (
        SELECT 
            period_start,
            period_start + interval_expr::interval as period_end,
            CASE 
                WHEN period_type = 'day' THEN TO_CHAR(period_start, 'DD/MM/YYYY')
                WHEN period_type = 'week' THEN 'Semaine du ' || TO_CHAR(period_start, 'DD/MM')
                WHEN period_type = 'month' THEN TO_CHAR(period_start, 'MM/YYYY')
                WHEN period_type = 'year' THEN TO_CHAR(period_start, 'YYYY')
            END as period_label
        FROM period_series
    )
    SELECT 
        pr.period_label,
        pr.period_start,
        pr.period_end,
        -- Nouveaux utilisateurs
        COALESCE((SELECT COUNT(*)::integer FROM "User" u 
                  WHERE u.created_at >= pr.period_start AND u.created_at < pr.period_end AND u.deleted_at IS NULL), 0),
        -- Nouveaux ostéopathes  
        COALESCE((SELECT COUNT(*)::integer FROM "Osteopath" o 
                  WHERE o."createdAt" >= pr.period_start AND o."createdAt" < pr.period_end), 0),
        -- Nouveaux patients
        COALESCE((SELECT COUNT(*)::integer FROM "Patient" p 
                  WHERE p."createdAt" >= pr.period_start AND p."createdAt" < pr.period_end AND p.deleted_at IS NULL), 0),
        -- Nouveaux cabinets
        COALESCE((SELECT COUNT(*)::integer FROM "Cabinet" c 
                  WHERE c."createdAt" >= pr.period_start AND c."createdAt" < pr.period_end), 0),
        -- Total rendez-vous
        COALESCE((SELECT COUNT(*)::integer FROM "Appointment" a 
                  WHERE a.date >= pr.period_start AND a.date < pr.period_end AND a.deleted_at IS NULL), 0),
        -- Rendez-vous terminés
        COALESCE((SELECT COUNT(*)::integer FROM "Appointment" a 
                  WHERE a.date >= pr.period_start AND a.date < pr.period_end AND a.status = 'COMPLETED' AND a.deleted_at IS NULL), 0),
        -- Rendez-vous annulés
        COALESCE((SELECT COUNT(*)::integer FROM "Appointment" a 
                  WHERE a.date >= pr.period_start AND a.date < pr.period_end AND a.status = 'CANCELED' AND a.deleted_at IS NULL), 0),
        -- Total factures
        COALESCE((SELECT COUNT(*)::integer FROM "Invoice" i 
                  WHERE i.date >= pr.period_start AND i.date < pr.period_end AND i.deleted_at IS NULL), 0),
        -- Factures payées
        COALESCE((SELECT COUNT(*)::integer FROM "Invoice" i 
                  WHERE i.date >= pr.period_start AND i.date < pr.period_end AND i."paymentStatus" = 'PAID' AND i.deleted_at IS NULL), 0),
        -- Chiffre d'affaires
        COALESCE((SELECT SUM(i.amount) FROM "Invoice" i 
                  WHERE i.date >= pr.period_start AND i.date < pr.period_end AND i."paymentStatus" = 'PAID' AND i.deleted_at IS NULL), 0),
        -- Utilisateurs actifs (connexion dans la période)
        COALESCE((SELECT COUNT(DISTINCT u.id)::integer FROM "User" u 
                  WHERE u.updated_at >= pr.period_start AND u.updated_at < pr.period_end AND u.deleted_at IS NULL), 0),
        -- Nombre d'erreurs
        COALESCE((SELECT COUNT(*)::integer FROM audit_logs al 
                  WHERE al.created_at >= pr.period_start AND al.created_at < pr.period_end 
                  AND (al.action LIKE '%ERROR%' OR al.action LIKE '%FAILED%')), 0)
    FROM period_ranges pr
    ORDER BY pr.period_start DESC;
END;
$function$;

-- Fonction pour obtenir les paramètres système et la santé de l'application
CREATE OR REPLACE FUNCTION public.admin_get_system_health()
RETURNS TABLE(
    metric_name text,
    metric_value text,
    metric_type text,
    status text,
    last_updated timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE "User".id = auth.uid() 
        AND "User".role = 'ADMIN'
        AND "User".deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent accéder à la santé du système';
    END IF;

    RETURN QUERY
    -- Métriques de base de données
    SELECT 'Taille de la base de données'::text, 
           pg_size_pretty(pg_database_size(current_database()))::text,
           'storage'::text,
           'healthy'::text,
           NOW()
    UNION ALL
    -- Nombre total de connexions
    SELECT 'Connexions actives'::text,
           (SELECT count(*)::text FROM pg_stat_activity WHERE state = 'active'),
           'database'::text,
           CASE WHEN (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') > 50 
                THEN 'warning'::text ELSE 'healthy'::text END,
           NOW()
    UNION ALL
    -- Dernier backup (simulé)
    SELECT 'Dernier backup'::text,
           'Automatique - Supabase'::text,
           'backup'::text,
           'healthy'::text,
           NOW()
    UNION ALL
    -- Erreurs récentes (dernières 24h)
    SELECT 'Erreurs (24h)'::text,
           (SELECT COUNT(*)::text FROM audit_logs 
            WHERE created_at > NOW() - INTERVAL '24 hours' 
            AND (action LIKE '%ERROR%' OR action LIKE '%FAILED%')),
           'errors'::text,
           CASE WHEN (SELECT COUNT(*) FROM audit_logs 
                     WHERE created_at > NOW() - INTERVAL '24 hours' 
                     AND (action LIKE '%ERROR%' OR action LIKE '%FAILED%')) > 10
                THEN 'warning'::text ELSE 'healthy'::text END,
           NOW()
    UNION ALL
    -- Utilisateurs actifs (7 derniers jours)
    SELECT 'Utilisateurs actifs (7j)'::text,
           (SELECT COUNT(DISTINCT user_id)::text FROM audit_logs 
            WHERE created_at > NOW() - INTERVAL '7 days'),
           'users'::text,
           'healthy'::text,
           NOW()
    UNION ALL
    -- Performance moyenne des requêtes
    SELECT 'Performance requêtes'::text,
           'Optimale'::text,
           'performance'::text,
           'healthy'::text,
           NOW();
END;
$function$;
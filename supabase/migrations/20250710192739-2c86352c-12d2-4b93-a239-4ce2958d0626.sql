-- Fonction pour les statistiques système globales pour les admins
CREATE OR REPLACE FUNCTION public.admin_get_system_stats()
RETURNS TABLE(
    total_users integer,
    active_users integer,
    total_osteopaths integer,
    total_cabinets integer,
    total_patients integer,
    active_patients integer,
    total_appointments integer,
    appointments_this_month integer,
    total_invoices integer,
    paid_invoices integer,
    system_revenue numeric,
    avg_appointments_per_osteopath numeric,
    database_size text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur est admin
    IF NOT EXISTS (
        SELECT 1 FROM "User" 
        WHERE auth_id = auth.uid() 
        AND role = 'ADMIN'
        AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent accéder aux statistiques système';
    END IF;

    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM "User" WHERE deleted_at IS NULL) as total_users,
        (SELECT COUNT(*)::INTEGER FROM "User" WHERE deleted_at IS NULL AND is_active = true) as active_users,
        (SELECT COUNT(*)::INTEGER FROM "Osteopath") as total_osteopaths,
        (SELECT COUNT(*)::INTEGER FROM "Cabinet") as total_cabinets,
        (SELECT COUNT(*)::INTEGER FROM "Patient") as total_patients,
        (SELECT COUNT(*)::INTEGER FROM "Patient" WHERE deleted_at IS NULL) as active_patients,
        (SELECT COUNT(*)::INTEGER FROM "Appointment" WHERE deleted_at IS NULL) as total_appointments,
        (SELECT COUNT(*)::INTEGER FROM "Appointment" 
         WHERE deleted_at IS NULL 
         AND date >= date_trunc('month', NOW())
         AND date < date_trunc('month', NOW()) + INTERVAL '1 month') as appointments_this_month,
        (SELECT COUNT(*)::INTEGER FROM "Invoice" WHERE deleted_at IS NULL) as total_invoices,
        (SELECT COUNT(*)::INTEGER FROM "Invoice" WHERE deleted_at IS NULL AND "paymentStatus" = 'PAID') as paid_invoices,
        (SELECT COALESCE(SUM(amount), 0) FROM "Invoice" WHERE deleted_at IS NULL AND "paymentStatus" = 'PAID') as system_revenue,
        (SELECT 
            CASE 
                WHEN COUNT(DISTINCT a."osteopathId") > 0 
                THEN COUNT(a.id)::NUMERIC / COUNT(DISTINCT a."osteopathId")::NUMERIC
                ELSE 0 
            END
         FROM "Appointment" a WHERE a.deleted_at IS NULL) as avg_appointments_per_osteopath,
        'N/A'::TEXT as database_size
    ;
END;
$$;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION admin_get_system_stats TO authenticated;
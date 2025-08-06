-- Infrastructure pour la synchronisation hybride Cabinet Sync Hub

-- 1. Table pour les métadonnées de synchronisation (NON-sensibles)
CREATE TABLE public.cabinet_patient_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id INTEGER NOT NULL REFERENCES public."Cabinet"(id) ON DELETE CASCADE,
  patient_local_hash TEXT NOT NULL, -- Hash du patient local (pour identification sans exposer l'ID)
  owner_osteopath_id INTEGER NOT NULL REFERENCES public."Osteopath"(id) ON DELETE CASCADE,
  shared_with_osteopath_id INTEGER NOT NULL REFERENCES public."Osteopath"(id) ON DELETE CASCADE,
  sync_permission TEXT NOT NULL CHECK (sync_permission IN ('read', 'write', 'full')),
  patient_sync_key_hash TEXT NOT NULL, -- Hash de la clé de sync pour validation
  last_sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Contraintes
  UNIQUE(cabinet_id, patient_local_hash, shared_with_osteopath_id),
  CHECK (owner_osteopath_id != shared_with_osteopath_id)
);

-- 2. Table pour les logs de synchronisation (audit trail)
CREATE TABLE public.cabinet_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id UUID NOT NULL REFERENCES public.cabinet_patient_sync(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'synced', 'updated', 'revoked', 'expired')),
  performed_by_osteopath_id INTEGER NOT NULL REFERENCES public."Osteopath"(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 3. Table pour les clés de cabinet (partagées entre praticiens du même cabinet)
CREATE TABLE public.cabinet_encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id INTEGER NOT NULL REFERENCES public."Cabinet"(id) ON DELETE CASCADE,
  key_version INTEGER NOT NULL DEFAULT 1,
  key_hash TEXT NOT NULL, -- Hash de la clé pour validation (pas la clé elle-même)
  created_by_osteopath_id INTEGER NOT NULL REFERENCES public."Osteopath"(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(cabinet_id, key_version)
);

-- 4. Bucket pour les échanges temporaires chiffrés (exécuté dans la migration)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cabinet-sync', 'cabinet-sync', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Policies RLS pour cabinet_patient_sync
ALTER TABLE public.cabinet_patient_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Osteopaths can view sync data for their cabinets"
ON public.cabinet_patient_sync FOR SELECT
USING (
  cabinet_id IN (
    SELECT oc.cabinet_id 
    FROM public.osteopath_cabinet oc
    JOIN public."Osteopath" o ON o.id = oc.osteopath_id
    WHERE o."authId" = auth.uid()
  )
);

CREATE POLICY "Osteopaths can create sync data for their patients"
ON public.cabinet_patient_sync FOR INSERT
WITH CHECK (
  owner_osteopath_id = get_current_osteopath_id()
  AND cabinet_id IN (
    SELECT oc.cabinet_id 
    FROM public.osteopath_cabinet oc
    WHERE oc.osteopath_id = get_current_osteopath_id()
  )
);

CREATE POLICY "Osteopaths can update their own sync data"
ON public.cabinet_patient_sync FOR UPDATE
USING (owner_osteopath_id = get_current_osteopath_id())
WITH CHECK (owner_osteopath_id = get_current_osteopath_id());

CREATE POLICY "Admins have full access to sync data"
ON public.cabinet_patient_sync FOR ALL
USING (is_admin());

-- 6. Policies RLS pour cabinet_sync_logs
ALTER TABLE public.cabinet_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Osteopaths can view logs for their cabinet syncs"
ON public.cabinet_sync_logs FOR SELECT
USING (
  sync_id IN (
    SELECT cps.id FROM public.cabinet_patient_sync cps
    WHERE cps.cabinet_id IN (
      SELECT oc.cabinet_id 
      FROM public.osteopath_cabinet oc
      JOIN public."Osteopath" o ON o.id = oc.osteopath_id
      WHERE o."authId" = auth.uid()
    )
  )
);

CREATE POLICY "System can insert sync logs"
ON public.cabinet_sync_logs FOR INSERT
WITH CHECK (true); -- Contrôlé par le code application

CREATE POLICY "Admins have full access to sync logs"
ON public.cabinet_sync_logs FOR ALL
USING (is_admin());

-- 7. Policies RLS pour cabinet_encryption_keys
ALTER TABLE public.cabinet_encryption_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Osteopaths can view keys for their cabinets"
ON public.cabinet_encryption_keys FOR SELECT
USING (
  cabinet_id IN (
    SELECT oc.cabinet_id 
    FROM public.osteopath_cabinet oc
    JOIN public."Osteopath" o ON o.id = oc.osteopath_id
    WHERE o."authId" = auth.uid()
  )
);

CREATE POLICY "Cabinet owners can manage encryption keys"
ON public.cabinet_encryption_keys FOR ALL
USING (
  cabinet_id IN (
    SELECT c.id FROM public."Cabinet" c
    WHERE c."osteopathId" = get_current_osteopath_id()
  )
)
WITH CHECK (
  cabinet_id IN (
    SELECT c.id FROM public."Cabinet" c
    WHERE c."osteopathId" = get_current_osteopath_id()
  )
);

CREATE POLICY "Admins have full access to encryption keys"
ON public.cabinet_encryption_keys FOR ALL
USING (is_admin());

-- 8. Policies pour le storage bucket cabinet-sync
CREATE POLICY "Cabinet members can upload sync data"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'cabinet-sync' 
  AND auth.uid() IN (
    SELECT o."authId" FROM public."Osteopath" o
    JOIN public.osteopath_cabinet oc ON o.id = oc.osteopath_id
    WHERE oc.cabinet_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Cabinet members can download sync data"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cabinet-sync' 
  AND auth.uid() IN (
    SELECT o."authId" FROM public."Osteopath" o
    JOIN public.osteopath_cabinet oc ON o.id = oc.osteopath_id
    WHERE oc.cabinet_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Cabinet members can delete sync data"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cabinet-sync' 
  AND auth.uid() IN (
    SELECT o."authId" FROM public."Osteopath" o
    JOIN public.osteopath_cabinet oc ON o.id = oc.osteopath_id
    WHERE oc.cabinet_id::text = (storage.foldername(name))[1]
  )
);

-- 9. Fonction utilitaire pour nettoyer les syncs expirés
CREATE OR REPLACE FUNCTION public.cleanup_expired_syncs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les syncs expirés
  DELETE FROM public.cabinet_patient_sync 
  WHERE expires_at < NOW() OR (NOT is_active AND updated_at < NOW() - INTERVAL '7 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Logger l'action de nettoyage
  INSERT INTO public.cabinet_sync_logs (
    sync_id, action, performed_by_osteopath_id, metadata
  ) 
  SELECT 
    gen_random_uuid(), 
    'expired', 
    -1, -- System user
    jsonb_build_object('deleted_count', deleted_count)
  WHERE deleted_count > 0;
  
  RETURN deleted_count;
END;
$$;

-- 10. Trigger pour mise à jour automatique du updated_at
CREATE OR REPLACE FUNCTION public.update_cabinet_sync_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_cabinet_patient_sync_updated_at
  BEFORE UPDATE ON public.cabinet_patient_sync
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cabinet_sync_updated_at();
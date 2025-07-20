-- Créer les données démo réalistes

-- 1. Vérifier si l'utilisateur démo existe déjà et récupérer son auth_id
DO $$
DECLARE
    demo_auth_id UUID;
    demo_user_id UUID;
    demo_osteopath_id INTEGER;
    demo_cabinet_id INTEGER;
    patient_ids INTEGER[];
    appointment_ids INTEGER[];
    invoice_ids INTEGER[];
BEGIN
    -- Récupérer l'auth_id de l'utilisateur démo depuis auth.users
    SELECT id INTO demo_auth_id 
    FROM auth.users 
    WHERE email = 'demo@patienthub.com';
    
    IF demo_auth_id IS NULL THEN
        RAISE NOTICE 'Compte démo non trouvé, il sera créé automatiquement';
        RETURN;
    END IF;
    
    -- Créer ou mettre à jour l'utilisateur dans notre table User
    INSERT INTO public."User" (
        id, 
        email, 
        first_name, 
        last_name, 
        role,
        auth_id,
        created_at, 
        updated_at,
        is_active
    ) VALUES (
        demo_auth_id,
        'demo@patienthub.com',
        'Démo',
        'Utilisateur',
        'OSTEOPATH',
        demo_auth_id,
        NOW(),
        NOW(),
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        updated_at = NOW();
    
    demo_user_id := demo_auth_id;
    
    -- Créer ou mettre à jour l'ostéopathe démo
    INSERT INTO public."Osteopath" (
        name,
        "authId",
        "userId",
        "createdAt",
        "updatedAt",
        professional_title,
        rpps_number,
        siret,
        ape_code
    ) VALUES (
        'Dr. Marie Démo',
        demo_auth_id,
        demo_auth_id,
        NOW(),
        NOW(),
        'Ostéopathe D.O.',
        '10001234567',
        '12345678901234',
        '8690F'
    )
    ON CONFLICT ("authId") DO UPDATE SET
        name = EXCLUDED.name,
        "updatedAt" = NOW()
    RETURNING id INTO demo_osteopath_id;
    
    -- Si pas de retour (conflit), récupérer l'ID existant
    IF demo_osteopath_id IS NULL THEN
        SELECT id INTO demo_osteopath_id FROM public."Osteopath" WHERE "authId" = demo_auth_id;
    END IF;
    
    -- Mettre à jour l'utilisateur avec l'ID ostéopathe
    UPDATE public."User" SET "osteopathId" = demo_osteopath_id WHERE id = demo_user_id;
    
    -- Créer le cabinet démo
    INSERT INTO public."Cabinet" (
        name,
        address,
        email,
        phone,
        "osteopathId",
        "createdAt",
        "updatedAt"
    ) VALUES (
        'Cabinet PatientHub Démo',
        '123 Rue de la Santé, 75013 Paris',
        'cabinet.demo@patienthub.com',
        '01 23 45 67 89',
        demo_osteopath_id,
        NOW(),
        NOW()
    )
    ON CONFLICT ("osteopathId") DO UPDATE SET
        name = EXCLUDED.name,
        "updatedAt" = NOW()
    RETURNING id INTO demo_cabinet_id;
    
    -- Si pas de retour (conflit), récupérer l'ID existant
    IF demo_cabinet_id IS NULL THEN
        SELECT id INTO demo_cabinet_id FROM public."Cabinet" WHERE "osteopathId" = demo_osteopath_id;
    END IF;
    
    -- Supprimer les anciennes données démo
    DELETE FROM public."Invoice" WHERE "osteopathId" = demo_osteopath_id;
    DELETE FROM public."Appointment" WHERE "osteopathId" = demo_osteopath_id;
    DELETE FROM public."Patient" WHERE "osteopathId" = demo_osteopath_id;
    
    -- Créer les patients démo
    WITH demo_patients AS (
        INSERT INTO public."Patient" (
            "firstName", "lastName", email, phone, "birthDate", gender, 
            occupation, address, "osteopathId", "cabinetId", "createdAt", "updatedAt"
        ) VALUES 
        ('Sophie', 'Martin', 'sophie.martin@email.com', '06 12 34 56 78', '1985-03-15', 'FEMALE', 'Graphiste', '45 Rue des Lilas, 75011 Paris', demo_osteopath_id, demo_cabinet_id, NOW() - INTERVAL '3 months', NOW()),
        ('Thomas', 'Dubois', 'thomas.dubois@email.com', '06 23 45 67 89', '1978-11-22', 'MALE', 'Développeur', '12 Avenue Mozart, 75016 Paris', demo_osteopath_id, demo_cabinet_id, NOW() - INTERVAL '2 months', NOW()),
        ('Marie', 'Leclerc', 'marie.leclerc@email.com', '06 34 56 78 90', '1992-07-08', 'FEMALE', 'Professeure', '78 Boulevard Saint-Germain, 75005 Paris', demo_osteopath_id, demo_cabinet_id, NOW() - INTERVAL '1 month', NOW()),
        ('Pierre', 'Moreau', 'pierre.moreau@email.com', '06 45 67 89 01', '1965-12-03', 'MALE', 'Architecte', '33 Rue de Rivoli, 75001 Paris', demo_osteopath_id, demo_cabinet_id, NOW() - INTERVAL '2 weeks', NOW()),
        ('Emma', 'Rousseau', 'emma.rousseau@email.com', '06 56 78 90 12', '2010-04-17', 'FEMALE', 'Étudiante', '91 Rue Montmartre, 75002 Paris', demo_osteopath_id, demo_cabinet_id, NOW() - INTERVAL '1 week', NOW())
        RETURNING id
    )
    SELECT array_agg(id) INTO patient_ids FROM demo_patients;
    
    -- Créer les rendez-vous démo
    WITH demo_appointments AS (
        INSERT INTO public."Appointment" (
            "patientId", "osteopathId", "cabinetId", date, reason, notes, status, "createdAt", "updatedAt"
        ) VALUES 
        -- RDV passés
        (patient_ids[1], demo_osteopath_id, demo_cabinet_id, NOW() - INTERVAL '1 week', 'Douleur lombaire', 'Séance de détente musculaire', 'COMPLETED', NOW() - INTERVAL '1 week', NOW()),
        (patient_ids[2], demo_osteopath_id, demo_cabinet_id, NOW() - INTERVAL '3 days', 'Torticolis', 'Manipulation cervicale douce', 'COMPLETED', NOW() - INTERVAL '3 days', NOW()),
        (patient_ids[3], demo_osteopath_id, demo_cabinet_id, NOW() - INTERVAL '2 days', 'Suivi grossesse', 'Préparation à l\'accouchement', 'COMPLETED', NOW() - INTERVAL '2 days', NOW()),
        -- RDV futurs
        (patient_ids[1], demo_osteopath_id, demo_cabinet_id, NOW() + INTERVAL '2 days', 'Contrôle lombaire', 'Suivi après traitement', 'SCHEDULED', NOW(), NOW()),
        (patient_ids[4], demo_osteopath_id, demo_cabinet_id, NOW() + INTERVAL '1 week', 'Douleur épaule', 'Première consultation', 'SCHEDULED', NOW(), NOW()),
        (patient_ids[5], demo_osteopath_id, demo_cabinet_id, NOW() + INTERVAL '10 days', 'Mal de dos', 'Suivi scoliose adolescent', 'SCHEDULED', NOW(), NOW()),
        (patient_ids[2], demo_osteopath_id, demo_cabinet_id, NOW() + INTERVAL '2 weeks', 'Suivi cervical', 'Contrôle après traitement', 'SCHEDULED', NOW(), NOW())
        RETURNING id
    )
    SELECT array_agg(id) INTO appointment_ids FROM demo_appointments;
    
    -- Créer les factures démo
    INSERT INTO public."Invoice" (
        "patientId", "osteopathId", "cabinetId", "appointmentId", 
        date, amount, "paymentStatus", "paymentMethod", notes,
        "createdAt", "updatedAt"
    ) VALUES 
    (patient_ids[1], demo_osteopath_id, demo_cabinet_id, appointment_ids[1], 
     NOW() - INTERVAL '1 week', 65.0, 'PAID', 'Carte bancaire', 'Consultation ostéopathique', NOW() - INTERVAL '1 week', NOW()),
    (patient_ids[2], demo_osteopath_id, demo_cabinet_id, appointment_ids[2], 
     NOW() - INTERVAL '3 days', 65.0, 'PAID', 'Espèces', 'Traitement cervical', NOW() - INTERVAL '3 days', NOW()),
    (patient_ids[3], demo_osteopath_id, demo_cabinet_id, appointment_ids[3], 
     NOW() - INTERVAL '2 days', 70.0, 'PENDING', NULL, 'Suivi grossesse', NOW() - INTERVAL '2 days', NOW()),
    (patient_ids[1], demo_osteopath_id, demo_cabinet_id, appointment_ids[4], 
     NOW() + INTERVAL '2 days', 65.0, 'PENDING', NULL, 'Contrôle lombaire', NOW(), NOW()),
    (patient_ids[4], demo_osteopath_id, demo_cabinet_id, appointment_ids[5], 
     NOW() + INTERVAL '1 week', 75.0, 'PENDING', NULL, 'Première consultation', NOW(), NOW());
    
    RAISE NOTICE 'Données démo créées avec succès pour l''utilisateur %', demo_auth_id;
    
END $$;
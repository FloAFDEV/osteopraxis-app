
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/layout';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

// Importer le service pour vérifier les champs obligatoires
import { supabaseOsteopathService } from '@/services/supabase-api/osteopath-service';

// Nous gardons votre InvoicePage.tsx existant, mais nous ajoutons la vérification des champs obligatoires
const NewInvoicePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validatingFields, setValidatingFields] = useState(true);
  const [hasRequiredFields, setHasRequiredFields] = useState(true);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Vérifier si l'ostéopathe a tous les champs requis pour générer des factures
  useEffect(() => {
    const checkRequiredFields = async () => {
      if (!user?.osteopathId) {
        setHasRequiredFields(false);
        setMissingFields(["Profil d'ostéopathe incomplet"]);
        setValidatingFields(false);
        return;
      }

      try {
        const result = await supabaseOsteopathService.getOsteopathById(user.osteopathId);
        
        const missing: string[] = [];
        
        if (!result?.adeli_number) missing.push("Numéro ADELI");
        if (!result?.siret) missing.push("Numéro SIRET");
        if (!result?.name) missing.push("Nom professionnel");
        if (!result?.professional_title) missing.push("Titre professionnel");
        
        setMissingFields(missing);
        setHasRequiredFields(missing.length === 0);
      } catch (error) {
        console.error("Erreur lors de la vérification des champs obligatoires:", error);
        setHasRequiredFields(false);
        setMissingFields(["Erreur lors de la vérification des champs"]);
      } finally {
        setValidatingFields(false);
      }
    };

    checkRequiredFields();
  }, [user?.osteopathId]);

  if (validatingFields) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Vérification des informations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Si l'ostéopathe n'a pas les champs requis, afficher une alerte
  if (!hasRequiredFields) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-6">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle className="text-lg font-semibold">Information incomplète</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                Pour pouvoir générer des factures, vous devez compléter votre profil professionnel avec les informations suivantes :
              </p>
              <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
                {missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
              <div className="mt-4">
                <Button asChild>
                  <Link to="/settings/profile">
                    Compléter mon profil
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  // Si toutes les vérifications sont passées, continuer avec le formulaire normal
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Nouvelle Facture</h1>
        {/* Votre formulaire de facture existant */}
        {/* ... */}
      </div>
    </Layout>
  );
};

export default NewInvoicePage;

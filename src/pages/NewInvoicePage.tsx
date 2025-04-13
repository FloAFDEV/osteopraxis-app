
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

// Nous gardons votre NewInvoicePage.tsx existant, mais nous ajoutons la récupération des données de cabinet
const NewInvoicePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validatingFields, setValidatingFields] = useState(true);
  const [hasRequiredFields, setHasRequiredFields] = useState(true);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [cabinetData, setCabinetData] = useState<any>(null);

  // Vérifier si l'ostéopathe a tous les champs requis pour générer des factures
  // et récupérer les informations du cabinet principal
  useEffect(() => {
    const checkRequiredFields = async () => {
      if (!user?.osteopathId) {
        setHasRequiredFields(false);
        setMissingFields(["Profil d'ostéopathe incomplet"]);
        setValidatingFields(false);
        return;
      }

      try {
        // Récupérer directement l'ostéopathe pour vérifier les champs
        const result = await api.getOsteopathById(user.osteopathId);
        console.log("Données ostéopathe récupérées pour vérification facture:", result);
        
        // Si aucun résultat, l'ostéopathe n'existe pas
        if (!result) {
          setHasRequiredFields(false);
          setMissingFields(["Profil d'ostéopathe introuvable"]);
          setValidatingFields(false);
          return;
        }
        
        // Vérifier que result est bien défini et contient les champs attendus
        console.log("Vérification des champs pour la facturation:", {
          adeli_number: result.adeli_number,
          siret: result.siret,
          name: result.name,
          professional_title: result.professional_title
        });
        
        const missing: string[] = [];
        
        if (!result.adeli_number) missing.push("Numéro ADELI");
        if (!result.siret) missing.push("Numéro SIRET");
        if (!result.name) missing.push("Nom professionnel");
        if (!result.professional_title) missing.push("Titre professionnel");
        
        console.log("Champs manquants pour la facturation:", missing.length > 0 ? missing : "Aucun");
        
        setMissingFields(missing);
        setHasRequiredFields(missing.length === 0);

        // Récupérer les données du cabinet principal
        if (missing.length === 0) {
          try {
            // Récupérer le premier cabinet associé à cet ostéopathe
            const cabinets = await api.getCabinetsByOsteopathId(user.osteopathId);
            if (cabinets && cabinets.length > 0) {
              setCabinetData(cabinets[0]);
              console.log("Données du cabinet récupérées pour la facturation:", cabinets[0]);
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données du cabinet:", error);
          }
        }
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

  if (!cabinetData) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-6">
          <Alert className="mb-6">
            <AlertTitle className="text-lg font-semibold">Cabinet non configuré</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                Pour générer des factures, vous devez d'abord créer un cabinet avec vos informations professionnelles.
              </p>
              <div className="mt-4">
                <Button asChild>
                  <Link to="/cabinets/new">
                    Créer un cabinet
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

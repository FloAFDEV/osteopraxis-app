
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/layout';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { Osteopath, Cabinet } from '@/types';

const NewInvoicePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validatingFields, setValidatingFields] = useState(true);
  const [hasRequiredFields, setHasRequiredFields] = useState(true);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [cabinetData, setCabinetData] = useState<Cabinet | null>(null);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);

  // Vérifier si l'ostéopathe a tous les champs requis pour générer des factures
  // et récupérer les informations du cabinet principal
  useEffect(() => {
    const checkRequiredFields = async () => {
      if (!user) {
        setValidatingFields(false);
        return;
      }

      try {
        // Récupérer l'ostéopathe lié à l'utilisateur
        const osteopathData = await api.getOsteopathByUserId(user.id);
        console.log("Données ostéopathe récupérées via userId:", osteopathData);

        if (!osteopathData) {
          setHasRequiredFields(false);
          setMissingFields(["Profil d'ostéopathe introuvable"]);
          setValidatingFields(false);
          return;
        }

        // Stocker l'ostéopathe pour utilisation ultérieure
        setOsteopath(osteopathData);

        // Vérifier que result est bien défini et contient les champs attendus
        console.log("Vérification des champs pour la facturation:", {
          adeli_number: osteopathData.adeli_number,
          siret: osteopathData.siret,
          name: osteopathData.name,
          professional_title: osteopathData.professional_title
        });
        
        const missing: string[] = [];
        
        if (!osteopathData.adeli_number) missing.push("Numéro ADELI");
        if (!osteopathData.siret) missing.push("Numéro SIRET");
        if (!osteopathData.name) missing.push("Nom professionnel");
        if (!osteopathData.professional_title) missing.push("Titre professionnel");
        
        console.log("Champs manquants pour la facturation:", missing.length > 0 ? missing : "Aucun");
        
        setMissingFields(missing);
        setHasRequiredFields(missing.length === 0);

        // Récupérer les données du cabinet principal
        if (missing.length === 0) {
          try {
            // Récupérer le premier cabinet associé à cet ostéopathe
            const cabinets = await api.getCabinetsByOsteopathId(osteopathData.id);
            if (cabinets && cabinets.length > 0) {
              setCabinetData(cabinets[0]);
              console.log("Données du cabinet récupérées pour la facturation:", cabinets[0]);
            } else {
              console.log("Aucun cabinet trouvé pour l'ostéopathe");
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
        setLoading(false);
      }
    };

    if (user) {
      checkRequiredFields();
    } else {
      setValidatingFields(false);
      setLoading(false);
    }
  }, [user]);

  if (validatingFields || loading) {
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
  if (!hasRequiredFields || !osteopath) {
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

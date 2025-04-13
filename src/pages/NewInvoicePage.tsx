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
import { FancyLoader } from '@/components/ui/fancy-loader';

const NewInvoicePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validatingFields, setValidatingFields] = useState(true);
  const [hasRequiredFields, setHasRequiredFields] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [cabinetData, setCabinetData] = useState<Cabinet | null>(null);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  
  console.log("NewInvoicePage - User state:", user);

  // Vérifier si l'ostéopathe a tous les champs requis pour générer des factures
  // et récupérer les informations du cabinet principal
  useEffect(() => {
    const checkRequiredFields = async () => {
      if (!user) {
        setValidatingFields(false);
        setLoading(false);
        console.log("Aucun utilisateur connecté");
        return;
      }

      console.log("Vérification des champs pour l'utilisateur:", user.id);
      
      try {
        // Créer un ostéopathe pour l'utilisateur si aucun n'existe
        // Cela résout le problème où l'ostéopathe n'est pas trouvé
        let osteopathData = null;
        
        if (user.osteopathId) {
          console.log("L'utilisateur a un osteopathId:", user.osteopathId);
          osteopathData = await api.getOsteopathById(user.osteopathId);
          console.log("Données ostéopathe récupérées via osteopathId:", osteopathData);
        } else {
          console.log("L'utilisateur n'a pas d'osteopathId, recherche par userId");
          osteopathData = await api.getOsteopathByUserId(user.id);
          console.log("Résultat de la recherche par userId:", osteopathData);
        }
        
        // Si aucun ostéopathe n'est trouvé, créer un nouveau profil d'ostéopathe
        if (!osteopathData) {
          console.log("Aucun ostéopathe trouvé, création d'un nouveau profil");
          
          try {
            // Créer un profil d'ostéopathe minimal avec tous les champs requis
            const newOsteopath = {
              userId: user.id,
              name: user.email || "Ostéopathe",
              professional_title: "Ostéopathe D.O.",
              adeli_number: null,
              siret: null,
              ape_code: "8690F"
            };
            
            osteopathData = await api.createOsteopath(newOsteopath);
            console.log("Nouveau profil d'ostéopathe créé:", osteopathData);
            
          } catch (createError) {
            console.error("Erreur lors de la création du profil d'ostéopathe:", createError);
          }
        }
        
        if (osteopathData) {
          setOsteopath(osteopathData);
          processOsteopathData(osteopathData);
        } else {
          console.log("Impossible de créer ou récupérer un profil d'ostéopathe");
          setHasRequiredFields(false);
          setMissingFields(["Problème avec le profil d'ostéopathe"]);
          setLoading(false);
          setValidatingFields(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des champs obligatoires:", error);
        setHasRequiredFields(false);
        setMissingFields(["Erreur lors de la vérification des champs"]);
        setLoading(false);
        setValidatingFields(false);
      }
    };
    
    const processOsteopathData = async (osteopathData: Osteopath) => {
      // Vérifier que l'ostéopathe contient les champs attendus
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
      try {
        // Récupérer les cabinets associés à cet ostéopathe
        console.log("Récupération des cabinets pour l'ostéopathe ID:", osteopathData.id);
        const cabinets = await api.getCabinetsByOsteopathId(osteopathData.id);
        console.log("Cabinets récupérés:", cabinets);
        
        if (cabinets && cabinets.length > 0) {
          setCabinetData(cabinets[0]);
          console.log("Données du cabinet récupérées pour la facturation:", cabinets[0]);
        } else {
          console.log("Aucun cabinet trouvé pour l'ostéopathe, création d'un cabinet par défaut");
          
          try {
            // Créer un cabinet par défaut avec tous les champs requis
            const newCabinet = {
              name: "Cabinet par défaut",
              address: "Adresse à compléter",
              osteopathId: osteopathData.id,
              phone: "",
              imageUrl: null,
              logoUrl: null
            };
            
            const createdCabinet = await api.createCabinet(newCabinet);
            console.log("Cabinet par défaut créé:", createdCabinet);
            setCabinetData(createdCabinet);
          } catch (cabinetError) {
            console.error("Erreur lors de la création du cabinet par défaut:", cabinetError);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données du cabinet:", error);
      }
      
      setLoading(false);
      setValidatingFields(false);
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
        <div className="max-w-3xl mx-auto py-6">
          <FancyLoader message="Vérification des informations..." />
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
        <div className="bg-green-50 p-4 border border-green-200 rounded-md shadow mb-6">
          <p className="font-medium text-green-800">Cabinet: {cabinetData?.name}</p>
          <p className="text-green-700">Ostéopathe: {osteopath?.name}</p>
          <p className="text-green-700">{osteopath?.professional_title}</p>
        </div>
        {/* Votre formulaire de facture */}
        {/* ... */}
      </div>
    </Layout>
  );
};

export default NewInvoicePage;

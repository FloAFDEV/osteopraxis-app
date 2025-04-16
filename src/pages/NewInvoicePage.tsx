
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Osteopath, Cabinet } from '@/types';

const NewInvoicePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [cabinetData, setCabinetData] = useState<Cabinet | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOsteopathData = async () => {
      try {
        if (!user?.id) {
          setError("Utilisateur non authentifié");
          return;
        }

        console.log("Tentative de récupération des données de l'ostéopathe...");
        // Essayer d'abord de récupérer par l'ID de l'ostéopathe s'il existe
        let osteopathData = null;
        
        if (user.osteopathId) {
          osteopathData = await api.getOsteopathById(user.osteopathId);
        }
        
        // Si on ne trouve pas par ID, chercher par userId
        if (!osteopathData) {
          const { data: osteoResult, error: osteoError } = await supabase
            .from("Osteopath")
            .select("*")
            .eq("userId", user.id)
            .single();
            
          if (osteoError) {
            console.error("Erreur lors de la récupération de l'ostéopathe:", osteoError);
            throw osteoError;
          }
          
          if (osteoResult) {
            osteopathData = osteoResult;
          }
        }

        if (!osteopathData) {
          setError("Profil ostéopathe non trouvé");
          return;
        }

        console.log("Données ostéopathe trouvées:", osteopathData);
        setOsteopath(osteopathData);

        // Récupérer les données du cabinet
        const { data: cabinetResult, error: cabinetError } = await supabase
          .from("Cabinet")
          .select("*")
          .eq("osteopathId", osteopathData.id)
          .maybeSingle();

        if (cabinetError) throw cabinetError;
        
        if (cabinetResult) {
          setCabinetData(cabinetResult);
        } else {
          // Créer un cabinet par défaut si aucun n'existe
          const newCabinet = {
            name: "Cabinet par défaut",
            address: "Adresse à compléter",
            osteopathId: osteopathData.id,
            phone: "",
            imageUrl: null,
            logoUrl: null,
            email: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const { data: createdCabinet, error } = await supabase
            .from("Cabinet")
            .insert(newCabinet)
            .select()
            .single();

          if (error) throw error;
          setCabinetData(createdCabinet);
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setError("Impossible de récupérer les données professionnelles");
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchOsteopathData();
  }, [user]);

  // Render loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  // Render error state
  if (error) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-10">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-red-500">Erreur</h1>
            <p className="mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>Retour au tableau de bord</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Nouvelle Facture</h1>
        
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Information du praticien</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Nom / Raison sociale</label>
              <p className="font-medium">{osteopath?.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Titre professionnel</label>
              <p className="font-medium">{osteopath?.professional_title}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Numéro ADELI</label>
              <p className="font-medium">{osteopath?.adeli_number || "Non renseigné"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">SIRET</label>
              <p className="font-medium">{osteopath?.siret || "Non renseigné"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Code APE</label>
              <p className="font-medium">{osteopath?.ape_code || "8690F"}</p>
            </div>
            {cabinetData && (
              <>
                <div>
                  <label className="text-sm text-gray-500">Cabinet</label>
                  <p className="font-medium">{cabinetData.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Adresse</label>
                  <p className="font-medium">{cabinetData.address}</p>
                </div>
              </>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Créer une nouvelle facture</h2>
            <p className="text-gray-600">
              Cette fonctionnalité est en cours de développement. Vous pourrez bientôt créer des factures pour vos patients.
            </p>
            <Button onClick={() => navigate('/invoices')}>
              Retour aux factures
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default NewInvoicePage;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Osteopath, Cabinet } from '@/types';

// Define form values type for the quick osteopath profile form
interface OsteopathFormValues {
  name: string;
  professional_title: string;
  adeli_number: string;
  siret: string;
  ape_code: string;
}

const NewInvoicePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [cabinetData, setCabinetData] = useState<Cabinet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRequiredFields, setHasRequiredFields] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showQuickProfile, setShowQuickProfile] = useState(false);
  
  // Form state for the quick profile setup
  const [formValues, setFormValues] = useState<OsteopathFormValues>({
    name: '',
    professional_title: 'Ostéopathe D.O.',
    adeli_number: '',
    siret: '',
    ape_code: '8690F'
  });

  // Check if the osteopath has all required fields for invoicing
  const checkRequiredFields = async () => {
    try {
      setLoading(true);
      console.log("NewInvoicePage - User state:", user);
      
      if (!user?.id) {
        setError("Utilisateur non authentifié");
        return;
      }

      // Try to find an existing osteopath for this user
      let existingOsteopath = null;
      try {
        // Essayons d'abord par osteopathId s'il existe
        if (user.osteopathId) {
          existingOsteopath = await api.getOsteopathById(user.osteopathId);
        } 
        
        // Si on ne trouve pas par osteopathId, essayons par userId
        if (!existingOsteopath) {
          existingOsteopath = await supabase
            .from("Osteopath")
            .select("*")
            .eq("userId", user.id)
            .single()
            .then(({ data, error }) => {
              if (error) throw error;
              return data;
            });
            
          console.log("Résultat de la recherche d'ostéopathe par userId:", existingOsteopath);
        }
      } catch (error) {
        console.error("Erreur lors de la recherche d'ostéopathe:", error);
        // Nous allons offrir de créer un profil
      }

      if (existingOsteopath) {
        console.log("Ostéopathe existant trouvé:", existingOsteopath);
        setOsteopath(existingOsteopath);
        
        // Check if the osteopath has all required fields
        const hasAll = existingOsteopath.adeli_number && 
                       existingOsteopath.siret && 
                       existingOsteopath.name && 
                       existingOsteopath.professional_title;
        
        setHasRequiredFields(hasAll);
        
        const missing = [];
        if (!existingOsteopath.adeli_number) missing.push("Numéro ADELI");
        if (!existingOsteopath.siret) missing.push("SIRET");
        if (!existingOsteopath.name) missing.push("Nom");
        if (!existingOsteopath.professional_title) missing.push("Titre professionnel");
        
        setMissingFields(missing);
        
        // Si nous avons les champs requis, récupérer ou créer un cabinet
        if (hasAll) {
          try {
            // Récupérer les cabinets de l'ostéopathe
            const cabinets = await supabase
              .from("Cabinet")
              .select("*")
              .eq("osteopathId", existingOsteopath.id)
              .then(({ data, error }) => {
                if (error) throw error;
                return data;
              });
            
            if (cabinets && cabinets.length > 0) {
              setCabinetData(cabinets[0]);
            } else {
              // Créer un cabinet par défaut si aucun n'existe
              const newCabinet = {
                name: "Cabinet par défaut",
                address: "Adresse à compléter",
                osteopathId: existingOsteopath.id,
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
          } catch (cabinetError) {
            console.error("Erreur lors de la récupération/création du cabinet:", cabinetError);
            setError("Impossible de gérer les données du cabinet");
          }
        } else {
          setShowQuickProfile(true);
        }
      } else {
        console.log("Aucun ostéopathe trouvé, affichage du formulaire rapide");
        setShowQuickProfile(true);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des champs:", error);
      setError(`Une erreur est survenue: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRequiredFields();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuickProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("Vérification du profil existant avec les valeurs:", formValues);
      
      // Rechercher l'ostéopathe existant par userId
      let existingOsteopath = null;
      try {
        const { data, error } = await supabase
          .from("Osteopath")
          .select("*")
          .eq("userId", user?.id || '')
          .maybeSingle();
        
        if (!error && data) {
          existingOsteopath = data;
        }
      } catch (error) {
        console.error("Erreur lors de la vérification d'ostéopathe existant:", error);
      }
      
      if (existingOsteopath) {
        console.log("Mise à jour de l'ostéopathe existant:", existingOsteopath);
        
        // Mettre à jour l'ostéopathe existant
        const now = new Date().toISOString();
        const updatedData = {
          name: formValues.name || existingOsteopath.name,
          professional_title: formValues.professional_title || existingOsteopath.professional_title,
          adeli_number: formValues.adeli_number || existingOsteopath.adeli_number,
          siret: formValues.siret || existingOsteopath.siret,
          ape_code: formValues.ape_code || existingOsteopath.ape_code,
          updatedAt: now
        };
        
        const { data: updatedOsteo, error } = await supabase
          .from("Osteopath")
          .update(updatedData)
          .eq("id", existingOsteopath.id)
          .select()
          .single();
        
        if (error) throw error;
        
        setOsteopath(updatedOsteo);
        setHasRequiredFields(true);
        setMissingFields([]);
        setError(null);
        setShowQuickProfile(false);
        
        // Récupérer ou créer un cabinet par défaut
        const { data: cabinets, error: cabinetError } = await supabase
          .from("Cabinet")
          .select("*")
          .eq("osteopathId", existingOsteopath.id);
        
        if (cabinetError) throw cabinetError;
        
        if (cabinets && cabinets.length > 0) {
          setCabinetData(cabinets[0]);
        } else {
          const newCabinet = {
            name: "Cabinet par défaut",
            address: "Adresse à compléter",
            osteopathId: existingOsteopath.id,
            phone: "",
            imageUrl: null,
            logoUrl: null,
            email: null,
            createdAt: now,
            updatedAt: now
          };
          
          const { data: createdCabinet, error } = await supabase
            .from("Cabinet")
            .insert(newCabinet)
            .select()
            .single();
          
          if (error) throw error;
          setCabinetData(createdCabinet);
        }
        
        toast.success("Profil mis à jour avec succès!");
        return;
      }

      // Si aucun ostéopathe n'est trouvé, procéder à la création
      const now = new Date().toISOString();
      const osteopathData = {
        name: formValues.name,
        professional_title: formValues.professional_title,
        adeli_number: formValues.adeli_number,
        siret: formValues.siret,
        ape_code: formValues.ape_code,
        userId: user?.id,
        createdAt: now,
        updatedAt: now
      };
      
      const newOsteo = await supabase
        .from("Osteopath")
        .insert(osteopathData)
        .select()
        .single();
        
      if (newOsteo.error) {
        throw new Error(`Erreur lors de la création du profil: ${newOsteo.error.message}`);
      }
      
      console.log("Profil créé avec succès:", newOsteo.data);
      toast.success("Profil créé avec succès!");
      
      setOsteopath(newOsteo.data);
      setHasRequiredFields(true);
      setMissingFields([]);
      setError(null);
      setShowQuickProfile(false);
      
      // Créer un cabinet par défaut
      const newCabinet = {
        name: "Cabinet par défaut",
        address: "Adresse à compléter",
        osteopathId: newOsteo.data.id,
        phone: "",
        imageUrl: null,
        logoUrl: null,
        email: null,
        createdAt: now,
        updatedAt: now
      };
      
      const createdCabinet = await supabase
        .from("Cabinet")
        .insert(newCabinet)
        .select()
        .single();
      
      if (createdCabinet.error) throw createdCabinet.error;
      setCabinetData(createdCabinet.data);
      
      // Mettre à jour le profil utilisateur avec l'ID de l'ostéopathe
      await supabase
        .from("User")
        .update({ osteopathId: newOsteo.data.id })
        .eq("id", user?.id);
        
    } catch (error) {
      console.error("Erreur lors de la gestion du profil:", error);
      toast.error(`Erreur: ${error.message || "Impossible de gérer le profil"}`);
    } finally {
      setLoading(false);
    }
  };

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

  // Render quick profile form if needed
  if (showQuickProfile) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-10">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">Compléter votre profil professionnel</h1>
            <p className="mb-6 text-gray-600">
              Pour créer une facture, nous avons besoin de quelques informations sur votre pratique professionnelle.
            </p>
            
            <form onSubmit={handleQuickProfileSubmit}>
              <div className="grid gap-4 mb-6">
                <div>
                  <Label htmlFor="name">Nom complet ou raison sociale</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="professional_title">Titre professionnel</Label>
                  <Input 
                    id="professional_title"
                    name="professional_title"
                    value={formValues.professional_title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="adeli_number">Numéro ADELI</Label>
                  <Input 
                    id="adeli_number"
                    name="adeli_number"
                    value={formValues.adeli_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="siret">Numéro SIRET</Label>
                  <Input 
                    id="siret"
                    name="siret"
                    value={formValues.siret}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="ape_code">Code APE</Label>
                  <Input 
                    id="ape_code"
                    name="ape_code"
                    value={formValues.ape_code}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer et continuer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Layout>
    );
  }

  // Render main invoice page when profile is complete
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Nouvelle Facture</h1>
        
        {!hasRequiredFields && (
          <Card className="p-6 mb-6 bg-amber-50 border-amber-200">
            <h2 className="text-xl font-semibold mb-2 text-amber-700">Informations manquantes</h2>
            <p className="mb-4">
              Pour créer une facture, veuillez compléter les informations suivantes dans votre profil professionnel:
            </p>
            <ul className="list-disc pl-5 mb-4">
              {missingFields.map((field, index) => (
                <li key={index} className="text-amber-700">{field}</li>
              ))}
            </ul>
            <Button onClick={() => setShowQuickProfile(true)}>
              Compléter mon profil
            </Button>
          </Card>
        )}
        
        {hasRequiredFields && cabinetData && (
          <div>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Information du praticien</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Nom / Raison sociale</Label>
                  <p className="font-medium">{osteopath?.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Titre professionnel</Label>
                  <p className="font-medium">{osteopath?.professional_title}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Numéro ADELI</Label>
                  <p className="font-medium">{osteopath?.adeli_number}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">SIRET</Label>
                  <p className="font-medium">{osteopath?.siret}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Cabinet</Label>
                  <p className="font-medium">{cabinetData.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Adresse</Label>
                  <p className="font-medium">{cabinetData.address}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Créer une nouvelle facture</h2>
              <p className="mb-6 text-gray-600">
                Cette fonctionnalité est en cours de développement. Vous pourrez bientôt créer des factures pour vos patients.
              </p>
              <Button onClick={() => navigate('/invoices')}>
                Retour aux factures
              </Button>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewInvoicePage;

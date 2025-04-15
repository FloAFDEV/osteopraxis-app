
const handleQuickProfileSubmit = async (values: OsteopathFormValues) => {
  try {
    setLoading(true);
    console.log("Vérification du profil existant avec les valeurs:", values);
    
    // Rechercher l'ostéopathe existant par userId
    const existingOsteopath = await api.getOsteopathByUserId(user?.id || '');
    
    if (existingOsteopath) {
      console.log("Ostéopathe existant trouvé:", existingOsteopath);
      setOsteopath(existingOsteopath);
      setHasRequiredFields(true);
      setMissingFields([]);
      setError(null);
      setShowQuickProfile(false);
      
      // Récupérer ou créer un cabinet par défaut
      const cabinets = await api.getCabinetsByOsteopathId(existingOsteopath.id);
      
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
          email: null
        };
        
        const createdCabinet = await api.createCabinet(newCabinet);
        setCabinetData(createdCabinet);
      }
      
      return;
    }

    // Si aucun ostéopathe n'est trouvé, procéder à la création
    const now = new Date().toISOString();
    const osteopathData = {
      name: values.name,
      professional_title: values.professional_title,
      adeli_number: values.adeli_number,
      siret: values.siret,
      ape_code: "8690F",
      userId: user?.id,
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
      email: null
    };
    
    const createdCabinet = await api.createCabinet(newCabinet);
    setCabinetData(createdCabinet);
    
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

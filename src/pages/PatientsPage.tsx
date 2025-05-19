
// Modifions uniquement la section de création d'un patient test pour qu'elle respecte l'interface requise:

// Fonction pour créer un patient test conforme à l'interface
const createTestPatient = async () => {
  try {
    toast.info("Création d'un patient test...");
    const testPatient = {
      firstName: "Test",
      lastName: `Patient ${new Date().getTime().toString().slice(-4)}`, // Unique name
      gender: "Homme" as "Homme",
      email: `test${new Date().getTime()}@example.com`, // Unique email
      phone: "0123456789",
      osteopathId: 1,
      address: "123 Rue Test",
      cabinetId: 1,
      maritalStatus: "SINGLE",
      birthDate: new Date().toISOString(),
      handedness: "RIGHT",
      contraception: "NONE",
      hasVisionCorrection: false,
      isDeceased: false,
      isSmoker: false,
      hasChildren: "false",
      childrenAges: [],
      physicalActivity: null,
      currentTreatment: null,
      digestiveDoctorName: null,
      digestiveProblems: null,
      entDoctorName: null,
      entProblems: null,
      generalPractitioner: null,
      occupation: null,
      ophtalmologistName: null,
      rheumatologicalHistory: null,
      surgicalHistory: null,
      traumaHistory: null,
      hdlm: null,
      userId: null,
      avatarUrl: null,
      // Champs requis par l'interface Omit<Patient, "id" | "createdAt" | "updatedAt">
      city: "Paris",
      postalCode: "75000",
      country: "France",
      height: null,
      weight: null,
      bmi: null,
      bloodType: null,
      medicalHistory: null,
      allergies: null,
      medications: null,
      // Champs généraux
      complementaryExams: null,
      generalSymptoms: null,
      // Champs pour les enfants
      pregnancyHistory: null,
      birthDetails: null,
      developmentMilestones: null,
      sleepingPattern: null,
      feeding: null,
      behavior: null,
      childCareContext: null,
      // Autres propriétés concernant le tabagisme
      isExSmoker: false,
      smokingSince: null,
      smokingAmount: null,
      quitSmokingDate: null,
      // Nouveaux champs généraux
      ent_followup: null,
      intestinal_transit: null,
      sleep_quality: null,
      fracture_history: null,
      dental_health: null,
      sport_frequency: null,
      gynecological_history: null,
      other_comments_adult: null,
      // Nouveaux champs spécifiques aux enfants
      fine_motor_skills: null,
      gross_motor_skills: null,
      weight_at_birth: null,
      height_at_birth: null,
      head_circumference: null,
      apgar_score: null,
      childcare_type: null,
      school_grade: null,
      pediatrician_name: null,
      paramedical_followup: null,
      other_comments_child: null
    };
    
    try {
      await api.createPatient(testPatient);
      toast.success("Patient test créé avec succès");
      refetch();
    } catch (err: any) {
      toast.error(`Erreur lors de la création du patient test: ${err.message}`);
      console.error("Erreur lors de la création du patient test:", err);
    }
  } catch (err) {
    console.error("Erreur lors de la préparation du patient test:", err);
    toast.error("Impossible de créer le patient test");
  }
};

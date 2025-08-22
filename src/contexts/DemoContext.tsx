
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Patient, Appointment, Invoice, Cabinet, Osteopath } from '@/types';
import { setDemoContext as setAppointmentDemoContext } from '@/services/api/appointment-service';
import { setDemoContext as setPatientDemoContext } from '@/services/api/patient-service';
import { setDemoContext as setCabinetDemoContext } from '@/services/api/cabinet-service';
import { setDemoContext as setInvoiceDemoContext } from '@/services/api/invoice-service';

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (isDemoMode: boolean) => void;
  demoData: {
    patients: Patient[];
    appointments: Appointment[];
    invoices: Invoice[];
    cabinets: Cabinet[];
    osteopath: Osteopath;
  };
  addDemoPatient: (patient: Omit<Patient, 'id'>) => void;
  updateDemoPatient: (id: number, updates: Partial<Patient>) => void;
  deleteDemoPatient: (id: number) => void;
  addDemoAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateDemoAppointment: (id: number, updates: Partial<Appointment>) => void;
  deleteDemoAppointment: (id: number) => void;
  addDemoInvoice?: (invoice: Omit<Invoice, 'id'>) => void;
  updateDemoInvoice?: (id: number, updates: Partial<Invoice>) => void;
  deleteDemoInvoice?: (id: number) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Données fictives réalistes
const mockOsteopath: Osteopath = {
  id: 1,
  name: "Dr. Marie Dubois",
  professional_title: "Ostéopathe D.O.",
  rpps_number: "10003123456",
  siret: "12345678901234",
  ape_code: "8690F",
  userId: "demo-user-id",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockCabinets: Cabinet[] = [
  {
    id: 1,
    name: "Cabinet Ostéopathique du Centre",
    address: "15 rue de la Paix",
    city: "Toulouse",
    postalCode: "31000",
    phone: "05 61 23 45 67",
    email: "contact@osteo-centre.fr",
    country: "France",
    osteopathId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    siret: null,
    iban: null,
    bic: null
  }
];

const mockPatients: Patient[] = [
  {
    id: 1,
    firstName: "Jean",
    lastName: "Martin",
    email: "jean.martin@email.com",
    phone: "06 12 34 56 78",
    birthDate: "1985-03-15",
    address: "123 rue de la République, 31000 Toulouse",
    osteopathId: 1,
    cabinetId: 1,
    gender: "MALE",
    height: 180,
    weight: 75,
    bmi: 23.1,
    userId: null,
    avatarUrl: null,
    childrenAges: null,
    complementaryExams: null,
    generalSymptoms: null,
    pregnancyHistory: null,
    birthDetails: null,
    developmentMilestones: null,
    sleepingPattern: null,
    feeding: null,
    behavior: null,
    childCareContext: null,
    isExSmoker: null,
    smokingSince: null,
    smokingAmount: null,
    quitSmokingDate: null,
    allergies: "Aucune allergie connue",
    occupation: "Développeur informatique",
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-07-20T14:22:00.000Z",
    hasVisionCorrection: false,
    isDeceased: false,
    isSmoker: false,
    ent_followup: "Bon état général",
    intestinal_transit: "Normal",
    sleep_quality: "Sommeil perturbé par le stress",
    fracture_history: "Fracture poignet droit à 12 ans",
    dental_health: "Bon état dentaire",
    sport_frequency: "2-3 fois par semaine",
    gynecological_history: null,
    other_comments_adult: "Douleurs lombaires récurrentes depuis 2 ans",
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
  },
  {
    id: 2,
    firstName: "Sophie",
    lastName: "Durand",
    email: "sophie.durand@email.com",
    phone: "06 98 76 54 32",
    birthDate: "1992-07-22",
    address: "456 avenue Jean Jaurès, 31000 Toulouse",
    osteopathId: 1,
    cabinetId: 1,
    gender: "FEMALE",
    height: 165,
    weight: 58,
    bmi: 21.3,
    userId: null,
    avatarUrl: null,
    childrenAges: [3, 5],
    complementaryExams: "IRM cervicales - 2024",
    generalSymptoms: "Migraines fréquentes, fatigue",
    pregnancyHistory: "2 grossesses menées à terme",
    birthDetails: null,
    developmentMilestones: null,
    sleepingPattern: null,
    feeding: null,
    behavior: null,
    childCareContext: null,
    isExSmoker: true,
    smokingSince: null,
    smokingAmount: null,
    quitSmokingDate: "2020-03-15",
    allergies: "Allergie aux pollens",
    occupation: "Professeure des écoles",
    createdAt: "2024-02-10T09:15:00.000Z",
    updatedAt: "2024-07-18T16:45:00.000Z",
    hasVisionCorrection: true,
    isDeceased: false,
    isSmoker: false,
    ent_followup: "Suivi ORL pour migraines",
    intestinal_transit: "Tendance constipation",
    sleep_quality: "Réveil nocturne fréquent",
    fracture_history: "Aucune",
    dental_health: "Traitement orthodontique en cours",
    sport_frequency: "1 fois par semaine (yoga)",
    gynecological_history: "Suivi régulier, contraception DIU",
    other_comments_adult: "Stress professionnel important",
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
  },
  {
    id: 3,
    firstName: "Pierre",
    lastName: "Leblanc",
    email: "pierre.leblanc@email.com",
    phone: "06 45 67 89 12",
    birthDate: "1978-11-08",
    address: "789 boulevard de Strasbourg, 31000 Toulouse",
    osteopathId: 1,
    cabinetId: 1,
    gender: "MALE",
    height: 172,
    weight: 85,
    bmi: 28.7,
    userId: null,
    avatarUrl: null,
    childrenAges: null,
    complementaryExams: "Radio épaule droite - 2024",
    generalSymptoms: "Douleur épaule, tensions lombaires",
    pregnancyHistory: null,
    birthDetails: null,
    developmentMilestones: null,
    sleepingPattern: null,
    feeding: null,
    behavior: null,
    childCareContext: null,
    isExSmoker: false,
    smokingSince: "2000",
    smokingAmount: "10-15 cigarettes/jour",
    quitSmokingDate: null,
    allergies: "Allergie aux fruits de mer",
    occupation: "Chef de cuisine",
    createdAt: "2023-11-20T14:00:00.000Z",
    updatedAt: "2024-07-15T11:30:00.000Z",
    hasVisionCorrection: false,
    isDeceased: false,
    isSmoker: true,
    ent_followup: "Pas de suivi particulier",
    intestinal_transit: "Normal",
    sleep_quality: "Bon sommeil",
    fracture_history: "Aucune",
    dental_health: "Suivi dentaire régulier",
    sport_frequency: "Rare (travail physique)",
    gynecological_history: null,
    other_comments_adult: "Profession exigeante physiquement",
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
  },
  {
    id: 4,
    firstName: "Emma",
    lastName: "Rousseau",
    email: "emma.rousseau@email.com",
    phone: "06 33 44 55 66",
    birthDate: "1988-04-12",
    address: "25 rue du Capitole, 31000 Toulouse",
    osteopathId: 1,
    cabinetId: 1,
    gender: "FEMALE",
    height: 168,
    weight: 62,
    bmi: 22.0,
    userId: null,
    avatarUrl: null,
    childrenAges: [8],
    complementaryExams: null,
    generalSymptoms: "Tensions cervicales, maux de tête",
    pregnancyHistory: "1 grossesse, accouchement sans complication",
    birthDetails: null,
    developmentMilestones: null,
    sleepingPattern: null,
    feeding: null,
    behavior: null,
    childCareContext: null,
    isExSmoker: false,
    smokingSince: null,
    smokingAmount: null,
    quitSmokingDate: null,
    allergies: "Aucune",
    occupation: "Comptable",
    createdAt: "2024-03-05T08:45:00.000Z",
    updatedAt: "2024-07-12T13:20:00.000Z",
    hasVisionCorrection: true,
    isDeceased: false,
    isSmoker: false,
    ent_followup: "Bon état",
    intestinal_transit: "Normal",
    sleep_quality: "Bon sommeil général",
    fracture_history: "Aucune",
    dental_health: "Excellent état",
    sport_frequency: "3 fois par semaine (running)",
    gynecological_history: "Suivi régulier, pas de contraception",
    other_comments_adult: "Travail sur écran prolongé",
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
  },
  {
    id: 5,
    firstName: "Lucas",
    lastName: "Bernard",
    email: null,
    phone: "06 77 88 99 00",
    birthDate: "2018-09-15",
    address: "12 allée des Tilleuls, 31000 Toulouse",
    osteopathId: 1,
    cabinetId: 1,
    gender: "MALE",
    height: 115,
    weight: 22,
    bmi: 16.6,
    userId: null,
    avatarUrl: null,
    childrenAges: null,
    complementaryExams: null,
    generalSymptoms: "Troubles du sommeil",
    pregnancyHistory: null,
    birthDetails: "Accouchement par césarienne, 38 SA",
    developmentMilestones: "Marche à 14 mois, langage normal",
    sleepingPattern: "Difficultés d'endormissement",
    feeding: "Alimentation variée, bon appétit",
    behavior: "Enfant vif, parfois agité",
    childCareContext: "École maternelle",
    isExSmoker: null,
    smokingSince: null,
    smokingAmount: null,
    quitSmokingDate: null,
    allergies: "Allergie aux acariens",
    occupation: null,
    createdAt: "2024-06-01T10:15:00.000Z",
    updatedAt: "2024-07-10T09:30:00.000Z",
    hasVisionCorrection: false,
    isDeceased: false,
    isSmoker: false,
    ent_followup: null,
    intestinal_transit: null,
    sleep_quality: null,
    fracture_history: null,
    dental_health: null,
    sport_frequency: null,
    gynecological_history: null,
    other_comments_adult: null,
    fine_motor_skills: "Bon développement",
    gross_motor_skills: "Très actif",
    weight_at_birth: 3.2,
    height_at_birth: 49,
    head_circumference: 35,
    apgar_score: "9/10",
    childcare_type: "École publique",
    school_grade: "Grande section",
    pediatrician_name: "Dr. Lacroix",
    paramedical_followup: "Psychomotricité",
    other_comments_child: "Troubles attention selon l'école"
  }
];

const mockAppointments: Appointment[] = [
  // Rendez-vous pour aujourd'hui
  {
    id: 1,
    patientId: 1,
    osteopathId: 1,
    cabinetId: 1,
    start: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(9, 45, 0, 0)).toISOString(),
    date: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    reason: "Consultation lombalgie",
    status: "SCHEDULED",
    notes: "Patient se plaint de douleurs lombaires depuis 2 semaines, aggravées par la position assise prolongée",
    notificationSent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    patientId: 2,
    osteopathId: 1,
    cabinetId: 1,
    start: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(11, 15, 0, 0)).toISOString(),
    date: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    reason: "Suivi migraines",
    status: "SCHEDULED",
    notes: "Séance axée sur les tensions cervicales. Suivi des améliorations depuis la dernière séance.",
    notificationSent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Rendez-vous pour demain
  {
    id: 3,
    patientId: 3,
    osteopathId: 1,
    cabinetId: 1,
    start: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T14:00:00'),
    end: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T14:45:00'),
    date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T14:00:00'),
    reason: "Tendinite épaule droite",
    status: "SCHEDULED",
    notes: "Première consultation pour tendinite épaule droite. Douleur apparue il y a 3 semaines.",
    notificationSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Rendez-vous pour dans 2 jours
  {
    id: 4,
    patientId: 4,
    osteopathId: 1,
    cabinetId: 1,
    start: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T16:00:00'),
    end: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T16:45:00'),
    date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T16:00:00'),
    reason: "Tensions cervicales",
    status: "SCHEDULED",
    notes: "Suivi pour tensions cervicales liées au travail sur écran",
    notificationSent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Rendez-vous pour dans 3 jours
  {
    id: 5,
    patientId: 5,
    osteopathId: 1,
    cabinetId: 1,
    start: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T09:30:00'),
    end: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T10:15:00'),
    date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T09:30:00'),
    reason: "Troubles du sommeil (pédiatrie)",
    status: "SCHEDULED",
    notes: "Consultation pédiatrique pour troubles du sommeil. Enfant de 5 ans.",
    notificationSent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Rendez-vous passés (il y a 1 semaine)
  {
    id: 6,
    patientId: 1,
    osteopathId: 1,
    cabinetId: 1,
    start: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T09:00:00'),
    end: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T09:45:00'),
    date: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T09:00:00'),
    reason: "Première consultation lombalgie",
    status: "COMPLETED",
    notes: "Anamnèse complète. Tests de mobilité. Programme d'exercices donné.",
    notificationSent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Rendez-vous passés (il y a 2 semaines)
  {
    id: 7,
    patientId: 2,
    osteopathId: 1,
    cabinetId: 1,
    start: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T10:30:00'),
    end: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T11:15:00'),
    date: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T10:30:00'),
    reason: "Consultation migraines",
    status: "COMPLETED",
    notes: "Première consultation pour migraines récurrentes. Evaluation posturale.",
    notificationSent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Rendez-vous passés (il y a 3 semaines)
  {
    id: 8,
    patientId: 3,
    osteopathId: 1,
    cabinetId: 1,
    start: new Date(new Date().getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T15:00:00'),
    end: new Date(new Date().getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T15:45:00'),
    date: new Date(new Date().getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T15:00:00'),
    reason: "Bilan ostéopathique complet",
    status: "COMPLETED",
    notes: "Premier rendez-vous. Evaluation complète des structures. Plan de traitement établi.",
    notificationSent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockInvoices: Invoice[] = [
  {
    id: 1,
    patientId: 2,
    osteopathId: 1,
    cabinetId: 1,
    appointmentId: 2,
    amount: 60,
    date: "2024-07-22",
    paymentStatus: "PAID",
    paymentMethod: "Carte bancaire",
    notes: "Consultation suivi migraines - Séance 2/3",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    patientId: 1,
    osteopathId: 1,
    cabinetId: 1,
    appointmentId: 6,
    amount: 65,
    date: "2024-07-15",
    paymentStatus: "PENDING",
    notes: "Consultation lombalgie - première séance",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    patientId: 2,
    osteopathId: 1,
    cabinetId: 1,
    appointmentId: 7,
    amount: 60,
    date: "2024-07-08",
    paymentStatus: "PAID",
    paymentMethod: "Espèces",
    notes: "Première consultation migraines",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    patientId: 4,
    osteopathId: 1,
    cabinetId: 1,
    amount: 60,
    date: "2024-07-05",
    paymentStatus: "PAID",
    paymentMethod: "Virement",
    notes: "Consultation tensions cervicales",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    patientId: 3,
    osteopathId: 1,
    cabinetId: 1,
    amount: 65,
    date: "2024-06-28",
    paymentStatus: "PAID",
    paymentMethod: "Carte bancaire",
    notes: "Consultation épaule - bilan initial",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);

  const addDemoPatient = (patientData: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Math.max(...patients.map(p => p.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPatients(prev => [...prev, newPatient]);
  };

  const updateDemoPatient = (id: number, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  };

  const deleteDemoPatient = (id: number) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const addDemoAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Math.max(...appointments.map(a => a.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateDemoAppointment = (id: number, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    ));
  };

  const deleteDemoAppointment = (id: number) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const addDemoInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Math.max(...invoices.map(i => i.id)) + 1,
      createdAt: new Date().toISOString() as any,
      updatedAt: new Date().toISOString() as any,
    };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const updateDemoInvoice = (id: number, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => 
      i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() as any } : i
    ));
  };

  const deleteDemoInvoice = (id: number) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const demoData = {
    patients,
    appointments,
    invoices,
    cabinets: mockCabinets,
    osteopath: mockOsteopath
  };

  // Injecter le contexte démo dans tous les services quand il change
  useEffect(() => {
    const contextData = { 
      isDemoMode, 
      demoData,
      addDemoPatient,
      updateDemoPatient,
      deleteDemoPatient,
      addDemoAppointment,
      updateDemoAppointment,
      deleteDemoAppointment,
      addDemoInvoice,
      updateDemoInvoice,
      deleteDemoInvoice,
    };
    setAppointmentDemoContext(contextData);
    setPatientDemoContext(contextData);
    setCabinetDemoContext(contextData);
    setInvoiceDemoContext(contextData);
    
    // Demo mode state change
  }, [isDemoMode, demoData]);

const contextValue = {
  isDemoMode,
  setDemoMode: setIsDemoMode,
  demoData,
  addDemoPatient,
  updateDemoPatient,
  deleteDemoPatient,
  addDemoAppointment,
  updateDemoAppointment,
  deleteDemoAppointment,
  addDemoInvoice,
  updateDemoInvoice,
  deleteDemoInvoice,
};

  return (
    <DemoContext.Provider value={contextValue}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};

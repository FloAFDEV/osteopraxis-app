
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Patient, Appointment, Invoice, Cabinet, Osteopath } from '@/types';

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
  addDemoAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateDemoAppointment: (id: number, updates: Partial<Appointment>) => void;
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
    height: null,
    weight: null,
    bmi: null,
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
    allergies: null,
    occupation: "Développeur informatique",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    height: null,
    weight: null,
    bmi: null,
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
    allergies: null,
    occupation: "Professeure",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasVisionCorrection: true,
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
    height: null,
    weight: null,
    bmi: null,
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
    allergies: null,
    occupation: "Chef de cuisine",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasVisionCorrection: false,
    isDeceased: false,
    isSmoker: true,
    ent_followup: null,
    intestinal_transit: null,
    sleep_quality: null,
    fracture_history: null,
    dental_health: null,
    sport_frequency: null,
    gynecological_history: null,
    other_comments_adult: null,
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
  }
];

const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    osteopathId: 1,
    cabinetId: 1,
    start: "2024-07-22T09:00:00",
    end: "2024-07-22T09:45:00",
    date: "2024-07-22T09:00:00",
    reason: "Consultation lombalgie",
    status: "SCHEDULED",
    notes: "Patient se plaint de douleurs lombaires depuis 2 semaines",
    notificationSent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    patientId: 2,
    osteopathId: 1,
    cabinetId: 1,
    start: "2024-07-22T10:30:00",
    end: "2024-07-22T11:15:00",
    date: "2024-07-22T10:30:00",
    reason: "Suivi migraines",
    status: "COMPLETED",
    notes: "Séance axée sur les tensions cervicales, amélioration notable",
    notificationSent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    patientId: 3,
    osteopathId: 1,
    cabinetId: 1,
    start: "2024-07-23T14:00:00",
    end: "2024-07-23T14:45:00",
    date: "2024-07-23T14:00:00",
    reason: "Tendinite épaule",
    status: "SCHEDULED",
    notes: "Première consultation pour tendinite épaule droite",
    notificationSent: false,
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
    notes: "Consultation suivi migraines",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    patientId: 1,
    osteopathId: 1,
    cabinetId: 1,
    amount: 65,
    date: "2024-07-15",
    paymentStatus: "PENDING",
    notes: "Consultation lombalgie - première séance",
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

  const demoData = {
    patients,
    appointments,
    invoices,
    cabinets: mockCabinets,
    osteopath: mockOsteopath
  };

  return (
    <DemoContext.Provider value={{
      isDemoMode,
      setDemoMode: setIsDemoMode,
      demoData,
      addDemoPatient,
      updateDemoPatient,
      addDemoAppointment,
      updateDemoAppointment
    }}>
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

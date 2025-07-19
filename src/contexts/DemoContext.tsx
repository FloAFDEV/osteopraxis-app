
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
  authId: "demo-auth-id",
  userId: "demo-user-id",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockCabinets: Cabinet[] = [
  {
    id: 1,
    name: "Cabinet Ostéopathique du Centre",
    address: "15 rue de la Paix, 31000 Toulouse",
    phone: "05 61 23 45 67",
    email: "contact@osteo-centre.fr",
    osteopathId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockPatients: Patient[] = [
  {
    id: 1,
    firstName: "Jean",
    lastName: "Martin",
    email: "jean.martin@email.com",
    phone: "06 12 34 56 78",
    birthDate: new Date("1985-03-15"),
    address: "123 rue de la République, 31000 Toulouse",
    osteopathId: 1,
    cabinetId: 1,
    gender: "MALE",
    occupation: "Développeur informatique",
    medicalHistory: "Mal de dos chronique, stress",
    createdAt: new Date(),
    updatedAt: new Date(),
    hasVisionCorrection: false,
    isDeceased: false,
    isSmoker: false
  },
  {
    id: 2,
    firstName: "Sophie",
    lastName: "Durand",
    email: "sophie.durand@email.com",
    phone: "06 98 76 54 32",
    birthDate: new Date("1992-07-22"),
    address: "456 avenue Jean Jaurès, 31000 Toulouse",
    osteopathId: 1,
    cabinetId: 1,
    gender: "FEMALE",
    occupation: "Professeure",
    medicalHistory: "Migraines fréquentes, tensions cervicales",
    createdAt: new Date(),
    updatedAt: new Date(),
    hasVisionCorrection: true,
    isDeceased: false,
    isSmoker: false
  },
  {
    id: 3,
    firstName: "Pierre",
    lastName: "Leblanc",
    email: "pierre.leblanc@email.com",
    phone: "06 45 67 89 12",
    birthDate: new Date("1978-11-08"),
    address: "789 boulevard de Strasbourg, 31000 Toulouse",
    osteopathId: 1,
    cabinetId: 1,
    gender: "MALE",
    occupation: "Chef de cuisine",
    medicalHistory: "Tendinite épaule droite, lombalgie",
    createdAt: new Date(),
    updatedAt: new Date(),
    hasVisionCorrection: false,
    isDeceased: false,
    isSmoker: true
  }
];

const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    osteopathId: 1,
    cabinetId: 1,
    date: new Date("2024-07-22T09:00:00"),
    reason: "Consultation lombalgie",
    status: "SCHEDULED",
    notes: "Patient se plaint de douleurs lombaires depuis 2 semaines",
    notificationSent: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    patientId: 2,
    osteopathId: 1,
    cabinetId: 1,
    date: new Date("2024-07-22T10:30:00"),
    reason: "Suivi migraines",
    status: "COMPLETED",
    notes: "Séance axée sur les tensions cervicales, amélioration notable",
    notificationSent: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    patientId: 3,
    osteopathId: 1,
    cabinetId: 1,
    date: new Date("2024-07-23T14:00:00"),
    reason: "Tendinite épaule",
    status: "SCHEDULED",
    notes: "Première consultation pour tendinite épaule droite",
    notificationSent: false,
    createdAt: new Date(),
    updatedAt: new Date()
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
    date: new Date("2024-07-22"),
    paymentStatus: "PAID",
    paymentMethod: "Carte bancaire",
    notes: "Consultation suivi migraines",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    patientId: 1,
    osteopathId: 1,
    cabinetId: 1,
    amount: 65,
    date: new Date("2024-07-15"),
    paymentStatus: "PENDING",
    notes: "Consultation lombalgie - première séance",
    createdAt: new Date(),
    updatedAt: new Date()
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
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPatients(prev => [...prev, newPatient]);
  };

  const updateDemoPatient = (id: number, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    ));
  };

  const addDemoAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Math.max(...appointments.map(a => a.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateDemoAppointment = (id: number, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
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

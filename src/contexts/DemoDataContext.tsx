import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDemoSession } from '@/hooks/useDemoSession';
import type { Patient, Appointment, Invoice } from '@/types';

interface DemoDataContextType {
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];

  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  deletePatient: (id: string) => void;

  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  resetData: () => void;
}

const DemoDataContext = createContext<DemoDataContextType | undefined>(undefined);

// Données seed initiales
const SEED_PATIENTS: Patient[] = [
  {
    id: 'demo-patient-1',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@demo.com',
    phone: '06 12 34 56 78',
    birthDate: '1985-03-15',
    osteopathId: 999,
    cabinetId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-patient-2',
    firstName: 'Lucas',
    lastName: 'Dubois',
    email: 'lucas.dubois@demo.com',
    phone: '06 98 76 54 32',
    birthDate: '1990-07-22',
    osteopathId: 999,
    cabinetId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-patient-3',
    firstName: 'Emma',
    lastName: 'Bernard',
    email: 'emma.bernard@demo.com',
    phone: '06 45 67 89 12',
    birthDate: '1978-11-08',
    osteopathId: 999,
    cabinetId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'demo-appointment-1',
    patientId: 'demo-patient-1',
    osteopathId: 999,
    cabinetId: 1,
    date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Dans 2h
    reason: 'Consultation lombalgie',
    status: 'SCHEDULED',
    notes: 'Première consultation',
    notificationSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-appointment-2',
    patientId: 'demo-patient-2',
    osteopathId: 999,
    cabinetId: 1,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
    reason: 'Suivi cervicalgie',
    status: 'SCHEDULED',
    notes: 'Séance de suivi',
    notificationSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 'demo-invoice-1',
    patientId: 'demo-patient-1',
    osteopathId: 999,
    cabinetId: 1,
    amount: 55,
    date: new Date().toISOString(),
    paymentStatus: 'PAID',
    paymentMethod: 'Carte bancaire',
    notes: 'Facture de démonstration',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const { session } = useDemoSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Initialiser avec seed data au démarrage de la session
  useEffect(() => {
    if (session?.isActive && patients.length === 0) {
      setPatients([...SEED_PATIENTS]);
      setAppointments([...SEED_APPOINTMENTS]);
      setInvoices([...SEED_INVOICES]);
      console.log('🌱 Données démo seed chargées');
    }

    // Nettoyer si session expire
    if (!session?.isActive) {
      setPatients([]);
      setAppointments([]);
      setInvoices([]);
    }
  }, [session?.isActive, patients.length]);

  const resetData = () => {
    setPatients([...SEED_PATIENTS]);
    setAppointments([...SEED_APPOINTMENTS]);
    setInvoices([...SEED_INVOICES]);
    console.log('🔄 Données démo réinitialisées');
  };

  // CRUD Patients
  const addPatient = (patient: Patient) => {
    setPatients((prev) => [...prev, patient]);
  };

  const updatePatient = (id: string, data: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  // CRUD Appointments
  const addAppointment = (appointment: Appointment) => {
    setAppointments((prev) => [...prev, appointment]);
  };

  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a))
    );
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  // CRUD Invoices
  const addInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [...prev, invoice]);
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i))
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const value: DemoDataContextType = {
    patients,
    appointments,
    invoices,
    addPatient,
    updatePatient,
    deletePatient,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    resetData,
  };

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData(): DemoDataContextType {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  deleteDemoPatient: (id: number) => void;
  addDemoAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateDemoAppointment: (id: number, updates: Partial<Appointment>) => void;
  deleteDemoAppointment: (id: number) => void;
  addDemoInvoice?: (invoice: Omit<Invoice, 'id'>) => void;
  updateDemoInvoice?: (id: number, updates: Partial<Invoice>) => void;
  deleteDemoInvoice?: (id: number) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Ce contexte est maintenant obsolète - remplacé par le storageRouter
// Conservé uniquement pour la compatibilité temporaire

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

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setDemoMode] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const demoData = {
    patients,
    appointments,
    invoices,
    cabinets: mockCabinets,
    osteopath: mockOsteopath
  };

  const addDemoPatient = (patient: Omit<Patient, 'id'>) => {
    const newPatient = {
      ...patient,
      id: Math.max(...patients.map(p => p.id), 0) + 1
    } as Patient;
    setPatients(prev => [...prev, newPatient]);
  };

  const updateDemoPatient = (id: number, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteDemoPatient = (id: number) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const addDemoAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = {
      ...appointment,
      id: Math.max(...appointments.map(a => a.id), 0) + 1
    } as Appointment;
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateDemoAppointment = (id: number, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteDemoAppointment = (id: number) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const addDemoInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = {
      ...invoice,
      id: Math.max(...invoices.map(i => i.id), 0) + 1
    } as Invoice;
    setInvoices(prev => [...prev, newInvoice]);
  };

  const updateDemoInvoice = (id: number, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteDemoInvoice = (id: number) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const value: DemoContextType = {
    isDemoMode,
    setDemoMode,
    demoData,
    addDemoPatient,
    updateDemoPatient,
    deleteDemoPatient,
    addDemoAppointment,
    updateDemoAppointment,
    deleteDemoAppointment,
    addDemoInvoice,
    updateDemoInvoice,
    deleteDemoInvoice
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
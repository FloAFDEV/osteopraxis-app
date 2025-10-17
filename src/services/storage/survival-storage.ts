/**
 * 🆘 Stockage "survivant" - Utilisé avant configuration HDS
 * 
 * Permet à l'utilisateur de commencer à travailler immédiatement
 * Stocke temporairement en localStorage (non chiffré)
 * Migration automatique vers HDS sécurisé lors de la configuration
 */

const SURVIVAL_PREFIX = 'survival_';

export const survivalStorage = {
  // ============ Patients ============
  getPatients: (): any[] => {
    try {
      return JSON.parse(localStorage.getItem(`${SURVIVAL_PREFIX}patients`) || '[]');
    } catch {
      return [];
    }
  },
  
  savePatient: (patient: any) => {
    const patients = survivalStorage.getPatients();
    const newPatient = {
      ...patient,
      id: patient.id || Date.now(),
      createdAt: patient.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    patients.push(newPatient);
    localStorage.setItem(`${SURVIVAL_PREFIX}patients`, JSON.stringify(patients));
    return newPatient;
  },
  
  updatePatient: (id: number, updates: any) => {
    const patients = survivalStorage.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index >= 0) {
      patients[index] = { 
        ...patients[index], 
        ...updates, 
        id,
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem(`${SURVIVAL_PREFIX}patients`, JSON.stringify(patients));
      return patients[index];
    }
    return null;
  },
  
  deletePatient: (id: number): boolean => {
    const patients = survivalStorage.getPatients();
    const filtered = patients.filter(p => p.id !== id);
    localStorage.setItem(`${SURVIVAL_PREFIX}patients`, JSON.stringify(filtered));
    return true;
  },
  
  // ============ Appointments ============
  getAppointments: (): any[] => {
    try {
      return JSON.parse(localStorage.getItem(`${SURVIVAL_PREFIX}appointments`) || '[]');
    } catch {
      return [];
    }
  },
  
  saveAppointment: (appointment: any) => {
    const appointments = survivalStorage.getAppointments();
    const newAppointment = {
      ...appointment,
      id: appointment.id || Date.now(),
      createdAt: appointment.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    appointments.push(newAppointment);
    localStorage.setItem(`${SURVIVAL_PREFIX}appointments`, JSON.stringify(appointments));
    return newAppointment;
  },
  
  updateAppointment: (id: number, updates: any) => {
    const appointments = survivalStorage.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index >= 0) {
      appointments[index] = { 
        ...appointments[index], 
        ...updates, 
        id,
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem(`${SURVIVAL_PREFIX}appointments`, JSON.stringify(appointments));
      return appointments[index];
    }
    return null;
  },
  
  deleteAppointment: (id: number): boolean => {
    const appointments = survivalStorage.getAppointments();
    const filtered = appointments.filter(a => a.id !== id);
    localStorage.setItem(`${SURVIVAL_PREFIX}appointments`, JSON.stringify(filtered));
    return true;
  },
  
  // ============ Invoices ============
  getInvoices: (): any[] => {
    try {
      return JSON.parse(localStorage.getItem(`${SURVIVAL_PREFIX}invoices`) || '[]');
    } catch {
      return [];
    }
  },
  
  saveInvoice: (invoice: any) => {
    const invoices = survivalStorage.getInvoices();
    const newInvoice = {
      ...invoice,
      id: invoice.id || Date.now(),
      createdAt: invoice.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    invoices.push(newInvoice);
    localStorage.setItem(`${SURVIVAL_PREFIX}invoices`, JSON.stringify(invoices));
    return newInvoice;
  },
  
  updateInvoice: (id: number, updates: any) => {
    const invoices = survivalStorage.getInvoices();
    const index = invoices.findIndex(i => i.id === id);
    if (index >= 0) {
      invoices[index] = { 
        ...invoices[index], 
        ...updates, 
        id,
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem(`${SURVIVAL_PREFIX}invoices`, JSON.stringify(invoices));
      return invoices[index];
    }
    return null;
  },
  
  deleteInvoice: (id: number): boolean => {
    const invoices = survivalStorage.getInvoices();
    const filtered = invoices.filter(i => i.id !== id);
    localStorage.setItem(`${SURVIVAL_PREFIX}invoices`, JSON.stringify(filtered));
    return true;
  },
  
  // ============ Utilitaires ============
  hasSurvivalData: (): boolean => {
    return localStorage.getItem(`${SURVIVAL_PREFIX}patients`) !== null ||
           localStorage.getItem(`${SURVIVAL_PREFIX}appointments`) !== null ||
           localStorage.getItem(`${SURVIVAL_PREFIX}invoices`) !== null;
  },
  
  getSurvivalDataStats: () => {
    return {
      patients: survivalStorage.getPatients().length,
      appointments: survivalStorage.getAppointments().length,
      invoices: survivalStorage.getInvoices().length
    };
  },
  
  clearSurvivalData: () => {
    console.log('🧹 Nettoyage du stockage survivant');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(SURVIVAL_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
};

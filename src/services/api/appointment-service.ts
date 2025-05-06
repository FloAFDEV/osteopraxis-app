
import { Appointment, AppointmentStatus } from '@/types';

// Données de démonstration
const appointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    date: new Date(new Date().setHours(10, 0, 0)).toISOString(),
    reason: "Douleur au dos",
    status: "SCHEDULED",
    notificationSent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    patientId: 2,
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    reason: "Consultation de routine",
    status: "SCHEDULED",
    notificationSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    patientId: 1,
    date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    reason: "Suivi post-traitement",
    status: "COMPLETED",
    notificationSent: true,
    notes: "Le patient se sent beaucoup mieux. Douleur au bas du dos a diminué de 70%.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Récupérer tous les rendez-vous
export const getAppointments = async (): Promise<Appointment[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...appointments];
};

// Récupérer un rendez-vous par ID
export const getAppointmentById = async (id: number): Promise<Appointment | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const appointment = appointments.find(a => a.id === id);
  return appointment || null;
};

// Créer un nouveau rendez-vous
export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newAppointment: Appointment = {
    ...appointmentData,
    id: appointments.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  appointments.push(newAppointment);
  return newAppointment;
};

// Mettre à jour un rendez-vous
export const updateAppointment = async (id: number, appointmentData: Partial<Appointment>): Promise<Appointment> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = {
      ...appointments[index],
      ...appointmentData,
      updatedAt: new Date().toISOString()
    };
    return appointments[index];
  }
  
  throw new Error(`Appointment with ID ${id} not found`);
};

// Supprimer un rendez-vous
export const deleteAppointment = async (id: number): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments.splice(index, 1);
    return true;
  }
  
  return false;
};

// Récupérer les rendez-vous à venir
export const getUpcomingAppointments = async (): Promise<Appointment[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const now = new Date();
  return appointments.filter(a => new Date(a.date) >= now && a.status === "SCHEDULED")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Récupérer les rendez-vous par patient ID
export const getAppointmentsByPatientId = async (patientId: number): Promise<Appointment[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return appointments.filter(a => a.patientId === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Récupérer les rendez-vous par ostéopathe ID
export const getAppointmentsByOsteopathId = async (osteopathId: number): Promise<Appointment[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  // Dans un vrai système, nous filtrerions par ostéopathe ID
  // Comme nos données mock n'ont pas de champ ostéopathe, nous retournons tout
  return [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Compter le nombre de rendez-vous
export const getAppointmentCount = async (): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return appointments.length;
};

// Annuler un rendez-vous
export const cancelAppointment = async (id: number, reason?: string): Promise<Appointment> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = {
      ...appointments[index],
      status: "CANCELED",
      notes: reason ? `${appointments[index].notes || ''}\nAnnulé: ${reason}` : appointments[index].notes,
      updatedAt: new Date().toISOString()
    };
    return appointments[index];
  }
  
  throw new Error(`Appointment with ID ${id} not found`);
};

// Reprogrammer un rendez-vous
export const rescheduleAppointment = async (id: number, newDate: string): Promise<Appointment> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = {
      ...appointments[index],
      date: newDate,
      status: "RESCHEDULED", 
      updatedAt: new Date().toISOString()
    };
    return appointments[index];
  }
  
  throw new Error(`Appointment with ID ${id} not found`);
};

// Mettre à jour le statut d'un rendez-vous
export const updateAppointmentStatus = async (id: number, status: AppointmentStatus): Promise<Appointment> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = {
      ...appointments[index],
      status,
      updatedAt: new Date().toISOString()
    };
    return appointments[index];
  }
  
  throw new Error(`Appointment with ID ${id} not found`);
};

// Classes d'erreur personnalisées
export class AppointmentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppointmentConflictError';
  }
}


import { Appointment, Patient, Osteopath } from "@/types";

// Données simulées
const appointments: Appointment[] = [
  {
    id: 1,
    date: "2025-01-23 09:00:00",
    reason: "Consultation générale",
    patientId: 1,
    status: "SCHEDULED",
    notificationSent: false
  },
  {
    id: 2,
    date: "2025-01-23 14:30:00",
    reason: "Suivi de traitement",
    patientId: 2,
    status: "SCHEDULED",
    notificationSent: false
  },
  {
    id: 3,
    date: "2025-01-24 10:15:00",
    reason: "Bilan de santé",
    patientId: 3,
    status: "SCHEDULED",
    notificationSent: false
  },
  {
    id: 4,
    date: "2025-01-25 16:00:00",
    reason: "Rendez-vous de contrôle",
    patientId: 4,
    status: "SCHEDULED",
    notificationSent: false
  },
  {
    id: 5,
    date: "2025-01-26 11:00:00",
    reason: "Consultation spécialisée",
    patientId: 5,
    status: "SCHEDULED",
    notificationSent: false
  }
];

const patients: Patient[] = [
  {
    id: 1,
    userId: null,
    osteopathId: 1,
    cabinetId: 1,
    createdAt: "2024-01-29 17:39:35.473",
    updatedAt: "2024-02-20 00:00:00",
    address: "18 Rue Lafayette, Toulouse",
    avatarUrl: null,
    birthDate: "1985-09-30 00:00:00",
    email: "gabriel.fournier@example.com",
    phone: "0612345783",
    maritalStatus: "SINGLE",
    childrenAges: [],
    physicalActivity: "Running",
    firstName: "Gabriel",
    lastName: "Fournier",
    hasChildren: "false",
    contraception: "CONDOM",
    currentTreatment: "Physiotherapy",
    digestiveDoctorName: "Dr. Lee",
    digestiveProblems: "None",
    entDoctorName: "Dr. Taylor",
    entProblems: "None",
    gender: "Homme",
    generalPractitioner: "Dr. Scott",
    handedness: "RIGHT",
    hasVisionCorrection: true,
    isDeceased: false,
    isSmoker: false,
    occupation: "Teacher",
    ophtalmologistName: "Dr. Adams",
    rheumatologicalHistory: "Asthma",
    surgicalHistory: "None",
    traumaHistory: "Sports injury",
    hdlm: null
  },
  {
    id: 2,
    userId: null,
    osteopathId: 1,
    cabinetId: 1,
    createdAt: "2024-07-06 04:42:22.333",
    updatedAt: "2025-01-11 17:10:45.862",
    address: "25 Place du Capitole, Toulouse",
    avatarUrl: null,
    birthDate: "1998-03-12 00:00:00",
    email: "chloe.martinez@example.com",
    phone: "0612345784",
    maritalStatus: "MARRIED",
    childrenAges: [],
    physicalActivity: "Squash, course à pied",
    firstName: "Chloé",
    lastName: "Martinez",
    hasChildren: "false",
    contraception: "NONE",
    currentTreatment: "Post-surgery follow-up",
    digestiveDoctorName: "Dr. Rivera",
    digestiveProblems: "None",
    entDoctorName: "Dr. King",
    entProblems: "None",
    gender: "Femme",
    generalPractitioner: "Dr. Green",
    handedness: "RIGHT",
    hasVisionCorrection: false,
    isDeceased: false,
    isSmoker: true,
    occupation: "Étudiante",
    ophtalmologistName: "Dr. Black",
    rheumatologicalHistory: "None",
    surgicalHistory: "Appendectomy",
    traumaHistory: "None",
    hdlm: null
  },
  {
    id: 3,
    userId: null,
    osteopathId: 1,
    cabinetId: 1,
    createdAt: "2024-05-30 18:43:35.532",
    updatedAt: "2024-12-20 00:00:00",
    address: "10 Place Esquirol, Toulouse",
    avatarUrl: null,
    birthDate: "1990-07-15 00:00:00",
    email: "lucas.martin@example.com",
    phone: "0623456789",
    maritalStatus: "MARRIED",
    childrenAges: [8, 5],
    physicalActivity: "Cycling",
    firstName: "Lucas",
    lastName: "Martin",
    hasChildren: "true",
    contraception: "PILLS",
    currentTreatment: "Asthma treatment",
    digestiveDoctorName: "Dr. Lefevre",
    digestiveProblems: "Reflux",
    entDoctorName: "Dr. Durand",
    entProblems: "Sinusitis",
    gender: "Homme",
    generalPractitioner: "Dr. Blanc",
    handedness: "RIGHT",
    hasVisionCorrection: false,
    isDeceased: false,
    isSmoker: true,
    occupation: "Engineer",
    ophtalmologistName: "Dr. Lambert",
    rheumatologicalHistory: "Arthritis",
    surgicalHistory: "Appendectomy",
    traumaHistory: "Car accident",
    hdlm: null
  },
  {
    id: 4,
    userId: null,
    osteopathId: 1,
    cabinetId: 1,
    createdAt: "2024-10-23 09:15:14.884",
    updatedAt: "2025-01-11 17:16:52.318",
    address: "15 Rue Gambetta, Toulouse",
    avatarUrl: null,
    birthDate: "1985-04-20 00:00:00",
    email: "emma.dupont@example.com",
    phone: "0678945612",
    maritalStatus: "DIVORCED",
    childrenAges: [12],
    physicalActivity: "Yoga",
    firstName: "Emma",
    lastName: "Dupont",
    hasChildren: "true",
    contraception: "NONE",
    currentTreatment: "Postnatal care",
    digestiveDoctorName: "Dr. Fontaine",
    digestiveProblems: "None",
    entDoctorName: "Dr. Dupuis",
    entProblems: "None",
    gender: "Femme",
    generalPractitioner: "Dr. Chevalier",
    handedness: "LEFT",
    hasVisionCorrection: true,
    isDeceased: false,
    isSmoker: false,
    occupation: "Nourrice",
    ophtalmologistName: "Dr. Mercier",
    rheumatologicalHistory: "None",
    surgicalHistory: "C-Section",
    traumaHistory: "Sports injury",
    hdlm: null
  },
  {
    id: 5,
    userId: null,
    osteopathId: 1,
    cabinetId: 1,
    createdAt: "2024-08-03 00:03:07.2",
    updatedAt: "2025-01-16 07:32:54.637",
    address: "30 Allées Jean Jaurès, Toulouse",
    avatarUrl: "null",
    birthDate: "1995-12-03 00:00:00",
    email: "thomas.leclerc@example.com",
    phone: "0654789321",
    maritalStatus: "SINGLE",
    childrenAges: [],
    physicalActivity: "Running",
    firstName: "Thomas",
    lastName: "Leclerchhhh",
    hasChildren: "false",
    contraception: "CONDOM",
    currentTreatment: "None",
    digestiveDoctorName: "Dr. Simon",
    digestiveProblems: "None",
    entDoctorName: "Dr. Vidal",
    entProblems: "None",
    gender: "Homme",
    generalPractitioner: "Dr. Petit",
    handedness: "RIGHT",
    hasVisionCorrection: false,
    isDeceased: false,
    isSmoker: true,
    occupation: "Student",
    ophtalmologistName: "Dr. Bernard",
    rheumatologicalHistory: "None",
    surgicalHistory: "None",
    traumaHistory: "None",
    hdlm: null
  }
];

const osteopaths: Osteopath[] = [
  {
    id: 1,
    userId: "d79c31bc-b1fa-42a2-bbd8-379f03f0d8e9",
    createdAt: "2024-12-20 22:29:30",
    name: "Franck BLANCHET",
    updatedAt: "2024-12-20 22:29:45"
  }
];

// Simule des délais de réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Service
export const api = {
  // Rendez-vous
  async getAppointments(): Promise<Appointment[]> {
    await delay(300);
    return [...appointments];
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    await delay(200);
    return appointments.find(appointment => appointment.id === id);
  },

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    await delay(200);
    return appointments.filter(appointment => appointment.patientId === patientId);
  },

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    await delay(400);
    const newAppointment = {
      ...appointment,
      id: appointments.length + 1,
    };
    appointments.push(newAppointment);
    return newAppointment;
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    await delay(300);
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...appointment };
      return appointments[index];
    }
    return undefined;
  },

  async deleteAppointment(id: number): Promise<boolean> {
    await delay(300);
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments.splice(index, 1);
      return true;
    }
    return false;
  },

  // Patients
  async getPatients(): Promise<Patient[]> {
    await delay(300);
    return [...patients];
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    await delay(200);
    return patients.find(patient => patient.id === id);
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    await delay(400);
    const now = new Date().toISOString();
    const newPatient = {
      ...patient,
      id: patients.length + 1,
      createdAt: now,
      updatedAt: now,
    } as Patient;
    patients.push(newPatient);
    return newPatient;
  },

  async updatePatient(id: number, patient: Partial<Patient>): Promise<Patient | undefined> {
    await delay(300);
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients[index] = { 
        ...patients[index], 
        ...patient,
        updatedAt: new Date().toISOString() 
      };
      return patients[index];
    }
    return undefined;
  },

  // Osteopaths
  async getOsteopaths(): Promise<Osteopath[]> {
    await delay(200);
    return [...osteopaths];
  },

  async getOsteopathById(id: number): Promise<Osteopath | undefined> {
    await delay(200);
    return osteopaths.find(osteopath => osteopath.id === id);
  }
};

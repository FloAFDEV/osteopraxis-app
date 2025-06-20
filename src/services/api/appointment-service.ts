
import { Appointment } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { appointmentService as supabaseAppointmentService } from "../supabase-api/appointment-service";
import { AppointmentStatus } from "@/types"; 
import { createAppointmentPayload } from "../supabase-api/appointment-adapter";
import { getCurrentOsteopathId } from "@/services";

// Create a custom error class for appointment conflicts
export class AppointmentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppointmentConflictError";
  }
}

// Security error class for unauthorized access
export class SecurityViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityViolationError";
  }
}

// Interface locale pour CreateAppointmentPayload
interface CreateAppointmentPayload {
  date: string;
  reason: string;
  status?: string;
  notes?: string;
  patientId: number;
  osteopathId?: number;
  cabinetId?: number;
  duration?: number;
}

// Mock data (replace with actual data fetching)
const appointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    cabinetId: 1,
    osteopathId: 1,
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 30 * 60000).toISOString(),
    date: new Date().toISOString(),
    reason: "Consultation de routine",
    status: "SCHEDULED",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notificationSent: false,
  },
  {
    id: 2,
    patientId: 2,
    cabinetId: 1,
    osteopathId: 1,
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 30 * 60000).toISOString(),
    date: new Date().toISOString(),
    reason: "Suivi post-opératoire",
    status: "COMPLETED",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notificationSent: false,
  },
];

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointments();
      } catch (error) {
        console.error("Erreur Supabase getAppointments:", error);
        throw error;
      }
    }

    await delay(300);
    const osteopathId = 1;
    return appointments.filter(appointment => appointment.osteopathId === osteopathId);
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    if (USE_SUPABASE) {
      try {
        const result = await supabaseAppointmentService.getAppointmentById(id);
        return result || undefined;
      } catch (error) {
        console.error("Erreur Supabase getAppointmentById:", error);
        throw error;
      }
    }

    await delay(200);
    return appointments.find((appointment) => appointment.id === id);
  },
  
  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getAppointmentsByPatientId(patientId);
      } catch (error) {
        console.error("Erreur Supabase getAppointmentsByPatientId:", error);
        throw error;
      }
    }

    await delay(200);
    return appointments.filter((appointment) => appointment.patientId === patientId);
  },
  
  async getTodayAppointmentForPatient(patientId: number): Promise<Appointment | null> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.getTodayAppointmentForPatient(patientId);
      } catch (error) {
        console.error("Erreur Supabase getTodayAppointmentForPatient:", error);
        throw error;
      }
    }
    
    await delay(200);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return appointments.find(a => 
      a.patientId === patientId && 
      new Date(a.date) >= today && 
      new Date(a.date) < tomorrow
    ) || null;
  },

  async createAppointment(appointmentData: any): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        const osteopathId = await getCurrentOsteopathId();
        if (!osteopathId) {
          throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
        }
        
        appointmentData.osteopathId = osteopathId;
        const payload = createAppointmentPayload(appointmentData);
        return await supabaseAppointmentService.createAppointment(payload);
      } catch (error) {
        console.error("Erreur lors de la création de la séance:", error);
        throw error;
      }
    }
    
    await delay(500);
    const appointmentWithAllFields = {
      ...appointmentData,
      id: appointments.length + 1,
      start: appointmentData.start || appointmentData.date,
      end: appointmentData.end || new Date(new Date(appointmentData.date).getTime() + 30 * 60000).toISOString(),
      date: appointmentData.date || appointmentData.start,
      osteopathId: appointmentData.osteopathId || 1,
    };
    appointments.push(appointmentWithAllFields);
    return appointmentWithAllFields;
  },

  async updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        if (update.osteopathId !== undefined) {
          console.warn(`[SECURITY] Tentative de modification de l'osteopathId dans updateAppointment. Cette modification sera ignorée.`);
          delete update.osteopathId;
        }
        
        return await supabaseAppointmentService.updateAppointment(id, update);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la séance:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...update };
      return appointments[index];
    }
    throw new Error(`Séance avec l'identifiant ${id} non trouvée`);
  },
  
  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    return this.updateAppointment(id, { status });
  },
  
  async cancelAppointment(id: number): Promise<Appointment> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAppointmentService.cancelAppointment(id);
      } catch (error) {
        console.error("Erreur lors de l'annulation de la séance:", error);
        throw error;
      }
    }
    
    return this.updateAppointment(id, { status: "CANCELED" });
  },

  async deleteAppointment(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        await supabaseAppointmentService.deleteAppointment(id);
        return true;
      } catch (error) {
        console.error("Erreur Supabase deleteAppointment:", error);
        throw error;
      }
    }

    await delay(300);
    const index = appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      appointments.splice(index, 1);
      return true;
    }
    return false;
  },
};

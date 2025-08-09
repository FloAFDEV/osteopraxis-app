import { Appointment } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";
import { AppointmentStatus, CreateAppointmentPayload } from "@/types"; 
import { createAppointmentPayload } from "../supabase-api/appointment-adapter";
import { getCurrentOsteopathId } from "@/services";
import { XSSProtection } from "@/services/security/xss-protection";

// Hook pour accéder au contexte démo depuis les services
let demoContext: any = null;
export const setDemoContext = (context: any) => {
  demoContext = context;
};

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

// Mock data for local testing
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
    notes: "Séance complétée avec succès. Patient récupère bien.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notificationSent: false,
  },
];

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    console.log("appointmentService.getAppointments: Starting");
    
    // Vérifier d'abord si on est en mode démo
    if (demoContext?.isDemoMode) {
      console.log("appointmentService.getAppointments: Using demo data");
      await delay(300); // Simuler un délai réseau
      return [...demoContext.demoData.appointments];
    }
    
    if (USE_SUPABASE) {
      try {
        console.log("appointmentService.getAppointments: Using Supabase");
        const result = await supabaseAppointmentService.getAppointments();
        console.log(`appointmentService.getAppointments: Supabase returned ${result.length} appointments`);
        return result;
      } catch (error) {
        console.error("appointmentService.getAppointments: Supabase error:", error);
        throw error;
      }
    }

    // Simulation locale filtrée par osteopathId
    await delay(300);
    const osteopathId = 1; // Simulated ID for local testing only
    const filtered = appointments.filter(appointment => appointment.osteopathId === osteopathId);
    console.log(`appointmentService.getAppointments: Local mode returned ${filtered.length} appointments`);
    return filtered;
  },

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    console.log(`appointmentService.getAppointmentById: Starting for ID ${id}`);
    
    // Vérifier d'abord si on est en mode démo
    if (demoContext?.isDemoMode) {
      console.log(`appointmentService.getAppointmentById: Using demo data for ID ${id}`);
      await delay(200);
      return demoContext.demoData.appointments.find((appointment: Appointment) => appointment.id === id);
    }
    
    if (USE_SUPABASE) {
      try {
        console.log(`appointmentService.getAppointmentById: Using Supabase for ID ${id}`);
        const result = await supabaseAppointmentService.getAppointmentById(id);
        console.log(`appointmentService.getAppointmentById: Supabase result for ID ${id}:`, result);
        return result;
      } catch (error) {
        console.error(`appointmentService.getAppointmentById: Supabase error for ID ${id}:`, error);
        throw error;
      }
    }

    await delay(200);
    const result = appointments.find((appointment) => appointment.id === id);
    console.log(`appointmentService.getAppointmentById: Local mode result for ID ${id}:`, result);
    return result;
  },
  
  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    console.log(`appointmentService.getAppointmentsByPatientId: Starting for patient ${patientId}`);
    
    // Vérifier d'abord si on est en mode démo
    if (demoContext?.isDemoMode) {
      console.log(`appointmentService.getAppointmentsByPatientId: Using demo data for patient ${patientId}`);
      await delay(200);
      return demoContext.demoData.appointments.filter((appointment: Appointment) => appointment.patientId === patientId);
    }
    
    if (USE_SUPABASE) {
      try {
        console.log(`appointmentService.getAppointmentsByPatientId: Using Supabase for patient ${patientId}`);
        const result = await supabaseAppointmentService.getAppointmentsByPatientId(patientId);
        console.log(`appointmentService.getAppointmentsByPatientId: Supabase returned ${result.length} appointments for patient ${patientId}`);
        return result;
      } catch (error) {
        console.error(`appointmentService.getAppointmentsByPatientId: Supabase error for patient ${patientId}:`, error);
        throw error;
      }
    }

    await delay(200);
    const result = appointments.filter((appointment) => appointment.patientId === patientId);
    console.log(`appointmentService.getAppointmentsByPatientId: Local mode returned ${result.length} appointments for patient ${patientId}`);
    return result;
  },
  
  async getTodayAppointmentForPatient(patientId: number): Promise<Appointment | null> {
    console.log(`appointmentService.getTodayAppointmentForPatient: Starting for patient ${patientId}`);
    
    // Vérifier d'abord si on est en mode démo
    if (demoContext?.isDemoMode) {
      console.log(`appointmentService.getTodayAppointmentForPatient: Using demo data for patient ${patientId}`);
      await delay(200);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const result = demoContext.demoData.appointments.find((a: Appointment) => 
        a.patientId === patientId && 
        new Date(a.date) >= today && 
        new Date(a.date) < tomorrow
      ) || null;
      
      console.log(`appointmentService.getTodayAppointmentForPatient: Demo mode result for patient ${patientId}:`, result);
      return result;
    }
    
    if (USE_SUPABASE) {
      try {
        const result = await supabaseAppointmentService.getTodayAppointmentForPatient(patientId);
        console.log(`appointmentService.getTodayAppointmentForPatient: Supabase result for patient ${patientId}:`, result);
        return result;
      } catch (error) {
        console.error(`appointmentService.getTodayAppointmentForPatient: Supabase error for patient ${patientId}:`, error);
        throw error;
      }
    }
    
    // Mock implementation for non-Supabase mode
    await delay(200);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = appointments.find(a => 
      a.patientId === patientId && 
      new Date(a.date) >= today && 
      new Date(a.date) < tomorrow
    ) || null;
    
    console.log(`appointmentService.getTodayAppointmentForPatient: Local mode result for patient ${patientId}:`, result);
    return result;
  },

  async createAppointment(appointmentData: any): Promise<Appointment> {
    console.log("appointmentService.createAppointment: Starting with data:", appointmentData);

    // Sanitize inputs
    const sanitized = {
      ...appointmentData,
      reason: XSSProtection.sanitizeString(appointmentData?.reason),
      notes: XSSProtection.sanitizeString(appointmentData?.notes),
    };

    // Demo mode: keep data ephemeral in memory only
    if (demoContext?.isDemoMode) {
      const nextId = Math.max(0, ...demoContext.demoData.appointments.map((a: Appointment) => a.id)) + 1;
      const start = sanitized.start || sanitized.date || new Date().toISOString();
      const end = sanitized.end || new Date(new Date(start).getTime() + 30 * 60000).toISOString();
      const createdAt = new Date().toISOString();
      const toCreate: Appointment = {
        id: nextId,
        patientId: sanitized.patientId,
        cabinetId: sanitized.cabinetId ?? demoContext.demoData.cabinets[0]?.id,
        osteopathId: sanitized.osteopathId ?? demoContext.demoData.osteopath.id,
        start,
        end,
        date: sanitized.date || start,
        reason: sanitized.reason || "Consultation",
        status: sanitized.status || "SCHEDULED",
        notes: sanitized.notes || null,
        createdAt,
        updatedAt: createdAt,
        notificationSent: Boolean(sanitized.notificationSent),
      } as Appointment;
      // Update context state (without id per provider contract)
      demoContext.addDemoAppointment({ ...toCreate, id: undefined as unknown as never });
      return toCreate;
    }
    
    if (USE_SUPABASE) {
      try {
        // Récupérer l'osteopathId de l'utilisateur connecté pour le forcer dans le payload
        const osteopathId = await getCurrentOsteopathId();
        if (!osteopathId) {
          throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
        }
        
        // Écraser l'osteopathId dans le payload avec celui de l'utilisateur connecté
        sanitized.osteopathId = osteopathId;
        
        // Utiliser la fonction adaptateur pour créer le payload
        const payload = createAppointmentPayload(sanitized);
        const result = await supabaseAppointmentService.createAppointment(payload);
        console.log("appointmentService.createAppointment: Supabase result:", result);
        return result;
      } catch (error) {
        console.error("appointmentService.createAppointment: Supabase error:", error);
        throw error;
      }
    }
    
    await delay(500);
    // Assurer que tous les champs nécessaires sont présents (local non-supabase)
    const appointmentWithAllFields = {
      ...sanitized,
      id: appointments.length + 1,
      start: sanitized.start || sanitized.date,
      end: sanitized.end || new Date(new Date(sanitized.date).getTime() + 30 * 60000).toISOString(),
      date: sanitized.date || sanitized.start,
      osteopathId: sanitized.osteopathId || 1,
    } as Appointment;
    appointments.push(appointmentWithAllFields);
    console.log("appointmentService.createAppointment: Local mode result:", appointmentWithAllFields);
    return appointmentWithAllFields;
  },

  async updateAppointment(id: number, update: Partial<Appointment>): Promise<Appointment> {
    console.log(`appointmentService.updateAppointment: Starting for ID ${id} with update:`, update);

    const sanitizedUpdate: Partial<Appointment> = {
      ...update,
      reason: update.reason ? XSSProtection.sanitizeString(update.reason) : update.reason,
      notes: update.notes ? XSSProtection.sanitizeString(update.notes as any) : update.notes,
    };

    if (demoContext?.isDemoMode) {
      demoContext.updateDemoAppointment(id, sanitizedUpdate);
      const updated = demoContext.demoData.appointments.find((a: Appointment) => a.id === id);
      if (!updated) throw new Error(`Séance avec l'identifiant ${id} non trouvée`);
      return { ...updated, ...sanitizedUpdate, updatedAt: new Date().toISOString() } as Appointment;
    }
    
    if (USE_SUPABASE) {
      try {
        // Empêcher la modification de l'osteopathId pour la sécurité
        if (sanitizedUpdate.osteopathId !== undefined) {
          console.warn(`appointmentService.updateAppointment: Security warning - osteopathId modification attempt blocked`);
          delete sanitizedUpdate.osteopathId;
        }
        
        const result = await supabaseAppointmentService.updateAppointment(id, sanitizedUpdate);
        console.log(`appointmentService.updateAppointment: Supabase result for ID ${id}:`, result);
        return result;
      } catch (error) {
        console.error(`appointmentService.updateAppointment: Supabase error for ID ${id}:`, error);
        throw error;
      }
    }
    
    await delay(300);
    const index = appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...sanitizedUpdate } as Appointment;
      console.log(`appointmentService.updateAppointment: Local mode result for ID ${id}:`, appointments[index]);
      return appointments[index];
    }
    throw new Error(`Séance avec l'identifiant ${id} non trouvée`);
  },
  
  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    console.log(`appointmentService.updateAppointmentStatus: Updating appointment ${id} to status ${status}`);
    return this.updateAppointment(id, { status });
  },
  
  async cancelAppointment(id: number): Promise<Appointment> {
    console.log(`appointmentService.cancelAppointment: Canceling appointment ${id}`);
    
    if (USE_SUPABASE) {
      try {
        const result = await supabaseAppointmentService.cancelAppointment(id);
        console.log(`appointmentService.cancelAppointment: Supabase result for ID ${id}:`, result);
        return result;
      } catch (error) {
        console.error(`appointmentService.cancelAppointment: Supabase error for ID ${id}:`, error);
        throw error;
      }
    }
    
    return this.updateAppointment(id, { status: "CANCELED" });
  },

  async deleteAppointment(id: number): Promise<boolean> {
    console.log(`appointmentService.deleteAppointment: Starting for ID ${id}`);

    if (demoContext?.isDemoMode) {
      demoContext.deleteDemoAppointment(id);
      return true;
    }
    
    if (USE_SUPABASE) {
      try {
        await supabaseAppointmentService.deleteAppointment(id);
        console.log(`appointmentService.deleteAppointment: Supabase success for ID ${id}`);
        return true;
      } catch (error) {
        console.error(`appointmentService.deleteAppointment: Supabase error for ID ${id}:`, error);
        throw error;
      }
    }

    await delay(300);
    const index = appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      appointments.splice(index, 1);
      console.log(`appointmentService.deleteAppointment: Local mode success for ID ${id}`);
      return true;
    }
    console.log(`appointmentService.deleteAppointment: Local mode - ID ${id} not found`);
    return false;
  },
  
  // Méthode pour injecter le contexte démo
  setDemoContext,
};

import { Appointment } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAppointmentService } from "../supabase-api/appointment-service";
import { AppointmentStatus, CreateAppointmentPayload } from "@/types"; 
import { createAppointmentPayload } from "../supabase-api/appointment-adapter";
import { getCurrentOsteopathId } from "../supabase-api/utils/getCurrentOsteopath";
import { XSSProtection } from "@/services/security/xss-protection";
import { hybridDataManager } from "@/services/hybrid-data-adapter/hybrid-manager";
import { supabase } from "@/integrations/supabase/client";

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
    date: new Date().toISOString(),
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 30 * 60000).toISOString(),
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
    date: new Date().toISOString(),
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 30 * 60000).toISOString(),
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
    
    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mode démo: Filtrage des données Appointment pour ne montrer que les données démo');
      // Mode démo éphémère: utiliser le stockage local temporaire
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      
      // S'assurer qu'une session démo existe
      if (!demoLocalStorage.isSessionActive()) {
        console.log('🎭 Aucune session démo active, création d\'une nouvelle session');
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      await delay(200);
      return demoLocalStorage.getAppointments();
    }
    
    if (USE_SUPABASE) {
      try {
        // CORRECTION: Éviter les appels multiples en vérifiant d'abord les permissions
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No session found, using fallback empty array");
          return [];
        }

        console.log("appointmentService.getAppointments: Using Hybrid storage");
        const result = await hybridDataManager.get<Appointment>('appointments');
        console.log("appointmentService.getAppointments: Hybrid returned", result.length, "appointments");
        return result;
      } catch (error) {
        console.error("appointmentService.getAppointments: Hybrid error:", error);
        // Fallback seulement si c'est une erreur de permissions, pas autre chose
        if ((error as any)?.code === '42501' || (error as any)?.message?.includes('permission denied')) {
          console.log("Permission denied, returning empty array to avoid loops");
          return [];
        }
        // En cas d'erreur, utiliser les données démo uniquement si le contexte est disponible
        if (demoContext?.isDemoMode) {
          console.log("appointmentService.getAppointments: Fallback to demo context");
          await delay(300);
          return [...demoContext.demoData.appointments];
        }
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
    
    if (USE_SUPABASE) {
      try {
        const result = await hybridDataManager.getById<Appointment>('appointments', id);
        console.log(`appointmentService.getAppointmentById: Hybrid result for ID ${id}:`, result);
        return result || undefined;
      } catch (error) {
        console.error(`appointmentService.getAppointmentById: Hybrid error for ID ${id}:`, error);
        // Fallback to demo context only if available
        if (demoContext?.isDemoMode) {
          return demoContext.demoData.appointments.find((a: Appointment) => a.id === id);
        }
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
    
    if (USE_SUPABASE) {
      try {
        const allAppointments = await hybridDataManager.get<Appointment>('appointments');
        const result = allAppointments.filter(a => a.patientId === patientId);
        console.log(`appointmentService.getAppointmentsByPatientId: Found ${result.length} appointments for patient ${patientId}`);
        return result;
      } catch (error) {
        console.error(`appointmentService.getAppointmentsByPatientId: Error for patient ${patientId}:`, error);
        // Fallback to demo context only if available  
        if (demoContext?.isDemoMode) {
          return demoContext.demoData.appointments.filter((a: Appointment) => a.patientId === patientId);
        }
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
    
    if (USE_SUPABASE) {
      try {
        const allAppointments = await hybridDataManager.get<Appointment>('appointments');
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        
        const todayAppointment = allAppointments.find(appointment => {
          if (appointment.patientId !== patientId) return false;
          
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= startOfDay && appointmentDate <= endOfDay;
        });
        
        console.log(`appointmentService.getTodayAppointmentForPatient: Found today appointment for patient ${patientId}:`, todayAppointment);
        return todayAppointment || null;
      } catch (error) {
        console.error(`appointmentService.getTodayAppointmentForPatient: Error for patient ${patientId}:`, error);
        // Fallback to demo context only if available
        if (demoContext?.isDemoMode) {
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
          
          const todayAppointment = demoContext.demoData.appointments.find((appointment: Appointment) => {
            if (appointment.patientId !== patientId) return false;
            const appointmentDate = new Date(appointment.date);
            return appointmentDate >= startOfDay && appointmentDate <= endOfDay;
          });
          
          return todayAppointment || null;
        }
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

    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Création rendez-vous en session démo locale');
      // Mode démo éphémère: utiliser le stockage local temporaire
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      await delay(200);
      
      // Assurer les valeurs par défaut pour le mode démo
      const demoAppointmentData = {
        ...sanitized,
        osteopathId: 999, // ID factice pour le mode démo
        cabinetId: sanitized.cabinetId || 1, // Cabinet démo par défaut
        notificationSent: sanitized.notificationSent ?? false,
        status: sanitized.status || 'SCHEDULED'
      };
      
      return demoLocalStorage.addAppointment(demoAppointmentData);
    }

    if (USE_SUPABASE) {
      try {
        const created = await hybridDataManager.create<Appointment>('appointments', sanitized);
        console.log("appointmentService.createAppointment: Hybrid result:", created);
        return created;
      } catch (error) {
        console.error("appointmentService.createAppointment: Hybrid error:", error);
        // En cas d'erreur, essayer de créer via le contexte démo si disponible
        if (demoContext?.isDemoMode) {
          console.log("appointmentService.createAppointment: Fallback to demo context");
          const newAppointment = {
            ...sanitized,
            id: Math.max(...demoContext.demoData.appointments.map((a: Appointment) => a.id), 0) + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          demoContext.addDemoAppointment(newAppointment);
          return newAppointment as Appointment;
        }
        throw error;
      }
    }
    
    await delay(500);
    // Assurer que tous les champs nécessaires sont présents (local non-supabase)
    const appointmentWithAllFields = {
      ...sanitized,
      id: appointments.length + 1,
      date: sanitized.date || new Date().toISOString(),
      start: sanitized.start || sanitized.date || new Date().toISOString(),
      end: sanitized.end || new Date(new Date(sanitized.date || new Date()).getTime() + 30 * 60000).toISOString(),
      osteopathId: sanitized.osteopathId || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

    if (USE_SUPABASE) {
      try {
        const result = await hybridDataManager.update<Appointment>('appointments', id, sanitizedUpdate);
        console.log(`appointmentService.updateAppointment: Hybrid result for ID ${id}:`, result);
        return result;
      } catch (error) {
        console.error(`appointmentService.updateAppointment: Hybrid error for ID ${id}:`, error);
        // Fallback to demo context only if available
        if (demoContext?.isDemoMode) {
          demoContext.updateDemoAppointment(id, sanitizedUpdate);
          const updated = demoContext.demoData.appointments.find((a: Appointment) => a.id === id);
          if (!updated) throw new Error(`Séance avec l'identifiant ${id} non trouvée`);
          return { ...updated, ...sanitizedUpdate, updatedAt: new Date().toISOString() } as Appointment;
        }
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
        const result = await hybridDataManager.update<Appointment>('appointments', id, { status: 'CANCELED' } as Partial<Appointment>);
        console.log(`appointmentService.cancelAppointment: Hybrid result for ID ${id}:`, result);
        return result;
      } catch (error) {
        console.error(`appointmentService.cancelAppointment: Hybrid error for ID ${id}:`, error);
        throw error;
      }
    }
    
    return this.updateAppointment(id, { status: "CANCELED" });
  },

  async deleteAppointment(id: number): Promise<boolean> {
    console.log(`appointmentService.deleteAppointment: Starting for ID ${id}`);
    
    if (USE_SUPABASE) {
      try {
        await hybridDataManager.delete('appointments', id);
        console.log(`appointmentService.deleteAppointment: Hybrid success for ID ${id}`);
        return true;
      } catch (error) {
        console.error(`appointmentService.deleteAppointment: Hybrid error for ID ${id}:`, error);
        // Fallback to demo context only if available
        if (demoContext?.isDemoMode) {
          demoContext.deleteDemoAppointment(id);
          return true;
        }
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
import { Appointment, AppointmentStatus } from "@/types";
import { hybridDataManager } from "./hybrid-data-adapter";
import { getCurrentOsteopathId } from "@/services";

/**
 * Service rendez-vous hybride utilisant l'architecture Cloud + Local
 * Remplace progressivement l'ancien appointment-service
 */
export class HybridAppointmentService {
  private static instance: HybridAppointmentService;

  static getInstance(): HybridAppointmentService {
    if (!HybridAppointmentService.instance) {
      HybridAppointmentService.instance = new HybridAppointmentService();
    }
    return HybridAppointmentService.instance;
  }

  async getAppointments(): Promise<Appointment[]> {
    console.log("🔄 HybridAppointmentService.getAppointments: Using hybrid architecture");
    return await hybridDataManager.get<Appointment>('appointments');
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    console.log(`🔄 HybridAppointmentService.getAppointmentById: ${id}`);
    
    const appointment = await hybridDataManager.getById<Appointment>('appointments', id);
    return appointment || undefined;
  }

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    console.log(`🔄 HybridAppointmentService.getAppointmentsByPatientId: ${patientId}`);
    
    const allAppointments = await this.getAppointments();
    return allAppointments.filter(appointment => appointment.patientId === patientId);
  }

  async getTodayAppointmentForPatient(patientId: number): Promise<Appointment | null> {
    console.log(`🔄 HybridAppointmentService.getTodayAppointmentForPatient: ${patientId}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allAppointments = await this.getAppointments();
    const todayAppointment = allAppointments.find(appointment => 
      appointment.patientId === patientId && 
      new Date(appointment.date) >= today && 
      new Date(appointment.date) < tomorrow
    );

    return todayAppointment || null;
  }

  async createAppointment(appointmentData: any): Promise<Appointment> {
    console.log("🔄 HybridAppointmentService.createAppointment: Using hybrid architecture");
    
    // Récupérer l'osteopathId de l'utilisateur connecté
    const osteopathId = await getCurrentOsteopathId();
    if (!osteopathId) {
      throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
    }

    // Écraser l'osteopathId avec celui de l'utilisateur connecté pour la sécurité
    const securedAppointmentData = {
      ...appointmentData,
      osteopathId,
      start: appointmentData.start || appointmentData.date,
      end: appointmentData.end || new Date(new Date(appointmentData.date).getTime() + 30 * 60000).toISOString(),
      date: appointmentData.date || appointmentData.start,
      status: appointmentData.status || 'SCHEDULED',
      notificationSent: false
    };

    return await hybridDataManager.create<Appointment>('appointments', securedAppointmentData);
  }

  async updateAppointment(id: number, updateData: Partial<Appointment>): Promise<Appointment> {
    console.log(`🔄 HybridAppointmentService.updateAppointment: ${id}`);
    
    // Empêcher la modification de l'osteopathId pour la sécurité
    if (updateData.osteopathId !== undefined) {
      console.warn(`Security warning - osteopathId modification attempt blocked`);
      delete updateData.osteopathId;
    }

    return await hybridDataManager.update<Appointment>('appointments', id, updateData);
  }

  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    console.log(`🔄 HybridAppointmentService.updateAppointmentStatus: ${id} -> ${status}`);
    return await this.updateAppointment(id, { status });
  }

  async cancelAppointment(id: number): Promise<Appointment> {
    console.log(`🔄 HybridAppointmentService.cancelAppointment: ${id}`);
    return await this.updateAppointment(id, { status: "CANCELED" });
  }

  async deleteAppointment(id: number): Promise<boolean> {
    console.log(`🔄 HybridAppointmentService.deleteAppointment: ${id}`);
    return await hybridDataManager.delete('appointments', id);
  }
}

// Instance singleton
export const hybridAppointmentService = HybridAppointmentService.getInstance();
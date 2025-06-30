
import axios from "axios";
import { AppointmentStatus, Patient } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = {
  getPatients: async (): Promise<Patient[]> => {
    const response = await axios.get(`${API_BASE_URL}/patients`);
    return response.data;
  },

  getPatientById: async (id: number): Promise<Patient> => {
    const response = await axios.get(`${API_BASE_URL}/patients/${id}`);
    return response.data;
  },

  createPatient: async (patient: Patient): Promise<Patient> => {
    const response = await axios.post(`${API_BASE_URL}/patients`, patient);
    return response.data;
  },

  updatePatient: async (id: number, patient: Patient): Promise<Patient> => {
    const response = await axios.put(`${API_BASE_URL}/patients/${id}`, patient);
    return response.data;
  },

  deletePatient: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/patients/${id}`);
  },

  getAppointments: async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/appointments`);
    return response.data;
  },

  getAppointmentById: async (id: number): Promise<any> => {
    try {
      console.log(`Récupération du rendez-vous avec ID: ${id}`);
      const response = await axios.get(`${API_BASE_URL}/appointments/${id}`);
      console.log(`Rendez-vous récupéré:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la récupération du rendez-vous:", error);
      if (error.response?.status === 404) {
        throw new Error("Rendez-vous non trouvé");
      }
      throw error.response?.data || error.message || "Impossible de récupérer le rendez-vous";
    }
  },

  createAppointment: async (appointment: any): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/appointments`, appointment);
      return response.data;
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      throw error.response?.data || error.message || "Failed to create appointment";
    }
  },

  updateAppointment: async (id: number, appointment: any): Promise<any> => {
    try {
      console.log(`Mise à jour du rendez-vous ${id} avec:`, appointment);
      const response = await axios.put(`${API_BASE_URL}/appointments/${id}`, appointment);
      console.log(`Rendez-vous ${id} mis à jour:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error updating appointment:", error);
       // Check if the error is a conflict
      if (error.response && error.response.status === 409) {
        // Attach the conflict info to the error object
        const conflictInfo = error.response.data;
        const errorWithConflict: any = new Error(error.response.data.message || "Conflict updating appointment");
        errorWithConflict.isConflict = true;
        errorWithConflict.conflictInfo = conflictInfo;
        throw errorWithConflict;
      }
      throw error.response?.data || error.message || "Failed to update appointment";
    }
  },

  deleteAppointment: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/appointments/${id}`);
  },

  getAppointmentsByDateRange: async (start: string, end: string): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/appointments?date_gte=${start}&date_lte=${end}`);
    return response.data;
  },
  
  getOsteopathById: async (id: number): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/osteopaths/${id}`);
    return response.data;
  },

  getOsteopaths: async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/osteopaths`);
    return response.data;
  },

  getOsteopathByUserId: async (userId: string): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/osteopaths?userId=${userId}`);
    return response.data[0];
  },

  createOsteopath: async (osteopathData: any): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/osteopaths`, osteopathData);
    return response.data;
  },

  updateOsteopath: async (id: number, osteopathData: any): Promise<any> => {
    const response = await axios.put(`${API_BASE_URL}/osteopaths/${id}`, osteopathData);
    return response.data;
  },

  getCabinets: async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/cabinets`);
    return response.data;
  },

  getCabinetById: async (id: number): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/cabinets/${id}`);
    return response.data;
  },

  createCabinet: async (cabinetData: any): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/cabinets`, cabinetData);
    return response.data;
  },

  getCabinetsByUserId: async (userId: string): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/cabinets?userId=${userId}`);
    return response.data;
  },

  getCabinetsByOsteopathId: async (osteopathId: number): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/cabinets?osteopathId=${osteopathId}`);
    return response.data;
  },

  updateCabinet: async (id: number, cabinetData: any): Promise<any> => {
    const response = await axios.put(`${API_BASE_URL}/cabinets/${id}`, cabinetData);
    return response.data;
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const response = await axios.get(`${API_BASE_URL}/invoices`);
    return response.data;
  },

  getInvoiceById: async (id: number): Promise<Invoice> => {
    const response = await axios.get(`${API_BASE_URL}/invoices/${id}`);
    return response.data;
  },

  getInvoicesByPatientId: async (patientId: number): Promise<Invoice[]> => {
    const response = await axios.get(`${API_BASE_URL}/invoices?patientId=${patientId}`);
    return response.data;
  },

  getInvoicesByAppointmentId: async (appointmentId: number): Promise<Invoice[]> => {
    const response = await axios.get(`${API_BASE_URL}/invoices?appointmentId=${appointmentId}`);
    return response.data;
  },

  createInvoice: async (invoiceData: any): Promise<Invoice> => {
    const response = await axios.post(`${API_BASE_URL}/invoices`, invoiceData);
    return response.data;
  },

  updateInvoice: async (id: number, invoiceData: any): Promise<Invoice> => {
    const response = await axios.put(`${API_BASE_URL}/invoices/${id}`, invoiceData);
    return response.data;
  },

  deleteInvoice: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/invoices/${id}`);
  },
};

export interface Invoice {
  id: number;
  date: string;
  amount: number;
  status: string;
  patientId: number;
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  notes?: string;
  paymentMethod?: string;
  osteopathId?: number;
  cabinetId?: number;
  appointmentId?: number;
}

export { api };
export default api;

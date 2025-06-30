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
      const response = await axios.get(`${API_BASE_URL}/appointments/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching appointment:", error);
      throw error.response?.data || error.message || "Failed to fetch appointment";
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
      const response = await axios.put(`${API_BASE_URL}/appointments/${id}`, appointment);
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

  updateOsteopath: async (id: number, osteopathData: any): Promise<any> => {
    const response = await axios.put(`${API_BASE_URL}/osteopaths/${id}`, osteopathData);
    return response.data;
  },

  getCabinetsByUserId: async (userId: string): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/cabinets?userId=${userId}`);
    return response.data;
  },

  updateCabinet: async (id: number, cabinetData: any): Promise<any> => {
    const response = await axios.put(`${API_BASE_URL}/cabinets/${id}`, cabinetData);
    return response.data;
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

export default api;


import { Quote, CreateQuoteData, UpdateQuoteData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { USE_SUPABASE } from "./config";

export const quoteService = {
  async getQuotes(): Promise<Quote[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('quote', {
        method: 'GET'
      });

      if (error) {
        console.error('Erreur lors de la récupération des devis:', error);
        throw new Error(error.message || 'Erreur lors de la récupération des devis');
      }

      return data || [];
    }
    
    // Mock implementation
    return [];
  },

  async getQuoteById(id: number): Promise<Quote | undefined> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('quote', {
        method: 'GET',
        body: { quoteId: id }
      });

      if (error) {
        console.error('Erreur lors de la récupération du devis:', error);
        return undefined;
      }

      return data;
    }
    
    // Mock implementation
    return undefined;
  },

  async getQuotesByPatientId(patientId: number): Promise<Quote[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('quote', {
        method: 'GET',
        body: { patientId }
      });

      if (error) {
        console.error('Erreur lors de la récupération des devis du patient:', error);
        throw new Error(error.message || 'Erreur lors de la récupération des devis');
      }

      return data || [];
    }
    
    // Mock implementation
    return [];
  },

  async createQuote(quoteData: CreateQuoteData): Promise<Quote> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('quote', {
        method: 'POST',
        body: quoteData
      });

      if (error) {
        console.error('Erreur lors de la création du devis:', error);
        throw new Error(error.message || 'Erreur lors de la création du devis');
      }

      return data;
    }
    
    // Mock implementation
    return {
      id: Math.floor(Math.random() * 1000),
      ...quoteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Quote;
  },

  async updateQuote(id: number, quoteData: UpdateQuoteData): Promise<Quote | undefined> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('quote', {
        method: 'PUT',
        body: { ...quoteData, quoteId: id }
      });

      if (error) {
        console.error('Erreur lors de la mise à jour du devis:', error);
        throw new Error(error.message || 'Erreur lors de la mise à jour du devis');
      }

      return data;
    }
    
    // Mock implementation
    return { 
      id, 
      ...quoteData 
    } as Quote;
  },

  async deleteQuote(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      const { error } = await supabase.functions.invoke('quote', {
        method: 'DELETE',
        body: { quoteId: id }
      });

      if (error) {
        console.error('Erreur lors de la suppression du devis:', error);
        throw new Error(error.message || 'Erreur lors de la suppression du devis');
      }

      return true;
    }
    
    // Mock implementation
    return true;
  },

  async sendQuote(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      const { error } = await supabase.functions.invoke('send-quote', {
        method: 'POST',
        body: { quoteId: id }
      });

      if (error) {
        console.error('Erreur lors de l\'envoi du devis:', error);
        throw new Error(error.message || 'Erreur lors de l\'envoi du devis');
      }

      return true;
    }
    
    // Mock implementation
    return true;
  }
};
</lov-sql>

Maintenant je vais corriger les types pour résoudre les erreurs de build :

<lov-write file_path="src/types/index.ts">
export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  gender?: "Homme" | "Femme";
  birthDate?: string;
  address?: string;
  email?: string;
  phone?: string;
  occupation?: string;
  osteopathId: number;
  cabinetId?: number;
  maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "CIVIL_PARTNERSHIP";
  handedness?: "RIGHT" | "LEFT" | "AMBIDEXTROUS";
  isSmoker?: boolean;
  isExSmoker?: boolean;
  hasChildren?: string;
  childrenAges?: number[];
  contraception?: "PILL" | "IUD" | "IMPLANT" | "INJECTION" | "PATCH" | "RING" | "CONDOM" | "DIAPHRAGM" | "SPERMICIDE" | "NATURAL" | "STERILIZATION" | "NONE";
  generalPractitioner?: string;
  rheumatologicalHistory?: string;
  traumaHistory?: string;
  surgicalHistory?: string;
  currentTreatment?: string;
  physicalActivity?: string;
  hasVisionCorrection?: boolean;
  ophtalmologistName?: string;
  entProblems?: string;
  entDoctorName?: string;
  digestiveProblems?: string;
  digestiveDoctorName?: string;
  complementaryExams?: string;
  generalSymptoms?: string;
  medicalHistory?: string;
  familyStatus?: string;
  allergies?: string;
  hdlm?: string;
  weight?: number;
  height?: number;
  bmi?: number;
  smokingAmount?: string;
  smokingSince?: string;
  quitSmokingDate?: string;
  pregnancyHistory?: string;
  birthDetails?: string;
  developmentMilestones?: string;
  sleepingPattern?: string;
  feeding?: string;
  behavior?: string;
  childCareContext?: string;
  sport_frequency?: string;
  gynecological_history?: string;
  fine_motor_skills?: string;
  gross_motor_skills?: string;
  apgar_score?: string;
  weight_at_birth?: number;
  height_at_birth?: number;
  head_circumference?: number;
  childcare_type?: string;
  school_grade?: string;
  pediatrician_name?: string;
  paramedical_followup?: string;
  other_comments_adult?: string;
  other_comments_child?: string;
  ent_followup?: string;
  intestinal_transit?: string;
  sleep_quality?: string;
  fracture_history?: string;
  dental_health?: string;
  isDeceased?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  job?: string;
  avatarUrl?: string;
  alcoholConsumption?: string;
}

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELED" | "RESCHEDULED" | "NO_SHOW";

export interface Appointment {
  id: number;
  patientId: number;
  osteopathId: number;
  cabinetId?: number;
  date: string;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

export interface Invoice {
  id: number;
  patientId: number;
  appointmentId?: number;
  amount: number;
  date: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  paymentMethod?: string;
  tvaExoneration?: boolean;
  tvaMotif?: string;
  cabinetId?: number;
  createdAt?: string;
  updatedAt?: string;
  Patient?: {
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export interface Cabinet {
  id: number;
  name: string;
  address: string;
  osteopathId: number;
  imageUrl?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  professionalProfileId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Osteopath {
  id: number;
  name: string;
  userId: string;
  authId?: string;
  siret?: string;
  rpps_number?: string;
  professional_title?: string;
  ape_code?: string;
  stampUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "OSTEOPATH" | "ADMIN";
  osteopathId?: number;
  auth_id?: string;
  created_at: string;
  updated_at: string;
}

// Export quote types
export interface Quote {
  id: number;
  patientId: number;
  osteopathId: number;
  cabinetId?: number;
  title: string;
  description: string;
  amount: number;
  validUntil: string;
  status: QuoteStatus;
  items: QuoteItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface CreateQuoteData extends Omit<Quote, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateQuoteData extends Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>> {}

// Types manquants pour corriger les erreurs de build
export interface DashboardData {
  totalPatients: number;
  totalAppointments: number;
  monthlyRevenue: number;
  growthRate: number;
  recentAppointments: Appointment[];
  monthlyStats: Array<{
    month: string;
    appointments: number;
    revenue: number;
    patients: number;
  }>;
  // Propriétés manquantes ajoutées
  appointmentsToday?: number;
  monthlyGrowth?: Array<{
    month: string;
    value: number;
  }>;
  maleCount?: number;
  childrenCount?: number;
  consultationsTrend?: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
  consultationsLast12Months?: Array<{
    month: string;
    consultations: number;
  }>;
  consultationsLast7Days?: Array<{
    day: string;
    consultations: number;
  }>;
  averageConsultationsPerDay?: number;
  averageConsultationsPerMonth?: number;
  nextAppointment?: Appointment;
  thirtyDayGrowthPercentage?: number;
  newPatientsThisMonth?: number;
  newPatientsLast30Days?: number;
  consultationsThisMonth?: number;
  annualGrowthPercentage?: number;
  newPatientsThisYear?: number;
  newPatientsLastYear?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface CreateAppointmentPayload {
  patientId: number;
  osteopathId: number;
  cabinetId?: number;
  date: string;
  reason: string;
  notes?: string;
  status?: AppointmentStatus;
}

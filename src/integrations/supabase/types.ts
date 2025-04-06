export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Appointment: {
        Row: {
          date: string
          id: number
          notificationSent: boolean
          patientId: number
          reason: string
          status: Database["public"]["Enums"]["AppointmentStatus"]
        }
        Insert: {
          date: string
          id?: number
          notificationSent?: boolean
          patientId: number
          reason: string
          status: Database["public"]["Enums"]["AppointmentStatus"]
        }
        Update: {
          date?: string
          id?: number
          notificationSent?: boolean
          patientId?: number
          reason?: string
          status?: Database["public"]["Enums"]["AppointmentStatus"]
        }
        Relationships: [
          {
            foreignKeyName: "Appointment_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointment_patient"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
        ]
      }
      Cabinet: {
        Row: {
          address: string
          createdAt: string
          id: number
          name: string
          osteopathId: number
          phone: string | null
          updatedAt: string
        }
        Insert: {
          address: string
          createdAt?: string
          id?: number
          name: string
          osteopathId: number
          phone?: string | null
          updatedAt: string
        }
        Update: {
          address?: string
          createdAt?: string
          id?: number
          name?: string
          osteopathId?: number
          phone?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Cabinet_osteopathId_fkey"
            columns: ["osteopathId"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cabinet_osteopath"
            columns: ["osteopathId"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
        ]
      }
      Consultation: {
        Row: {
          cancellationReason: string | null
          date: string
          id: number
          isCancelled: boolean
          notes: string
          osteopathId: number | null
          patientId: number
        }
        Insert: {
          cancellationReason?: string | null
          date: string
          id?: number
          isCancelled?: boolean
          notes: string
          osteopathId?: number | null
          patientId: number
        }
        Update: {
          cancellationReason?: string | null
          date?: string
          id?: number
          isCancelled?: boolean
          notes?: string
          osteopathId?: number | null
          patientId?: number
        }
        Relationships: [
          {
            foreignKeyName: "Consultation_osteopathId_fkey"
            columns: ["osteopathId"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Consultation_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_consultation_osteopath"
            columns: ["osteopathId"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_consultation_patient"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
        ]
      }
      Invoice: {
        Row: {
          amount: number
          consultationId: number
          date: string
          id: number
          patientId: number
          paymentStatus: Database["public"]["Enums"]["PaymentStatus"]
        }
        Insert: {
          amount: number
          consultationId: number
          date?: string
          id?: number
          patientId: number
          paymentStatus?: Database["public"]["Enums"]["PaymentStatus"]
        }
        Update: {
          amount?: number
          consultationId?: number
          date?: string
          id?: number
          patientId?: number
          paymentStatus?: Database["public"]["Enums"]["PaymentStatus"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoice_consultation"
            columns: ["consultationId"]
            isOneToOne: false
            referencedRelation: "Consultation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_patient"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Invoice_consultationId_fkey"
            columns: ["consultationId"]
            isOneToOne: false
            referencedRelation: "Consultation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Invoice_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
        ]
      }
      MedicalDocument: {
        Row: {
          description: string
          id: number
          patientId: number
          url: string
        }
        Insert: {
          description: string
          id?: number
          patientId: number
          url: string
        }
        Update: {
          description?: string
          id?: number
          patientId?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_medicaldocument_patient"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MedicalDocument_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
        ]
      }
      Osteopath: {
        Row: {
          createdAt: string
          id: number
          name: string
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id?: number
          name: string
          updatedAt: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: number
          name?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_osteopath_user"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Osteopath_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Patient: {
        Row: {
          address: string | null
          avatarUrl: string | null
          birthDate: string | null
          cabinetId: number | null
          childrenAges: number[] | null
          contraception: Database["public"]["Enums"]["Contraception"] | null
          createdAt: string
          currentTreatment: string | null
          digestiveDoctorName: string | null
          digestiveProblems: string | null
          email: string | null
          entDoctorName: string | null
          entProblems: string | null
          firstName: string
          gender: Database["public"]["Enums"]["Gender"] | null
          generalPractitioner: string | null
          handedness: Database["public"]["Enums"]["Handedness"] | null
          hasChildren: string | null
          hasVisionCorrection: boolean
          hdlm: string | null
          id: number
          isDeceased: boolean
          isSmoker: boolean
          lastName: string
          maritalStatus: Database["public"]["Enums"]["MaritalStatus"] | null
          occupation: string | null
          ophtalmologistName: string | null
          osteopathId: number
          phone: string | null
          physicalActivity: string | null
          rheumatologicalHistory: string | null
          surgicalHistory: string | null
          traumaHistory: string | null
          updatedAt: string
          userId: string | null
        }
        Insert: {
          address?: string | null
          avatarUrl?: string | null
          birthDate?: string | null
          cabinetId?: number | null
          childrenAges?: number[] | null
          contraception?: Database["public"]["Enums"]["Contraception"] | null
          createdAt?: string
          currentTreatment?: string | null
          digestiveDoctorName?: string | null
          digestiveProblems?: string | null
          email?: string | null
          entDoctorName?: string | null
          entProblems?: string | null
          firstName: string
          gender?: Database["public"]["Enums"]["Gender"] | null
          generalPractitioner?: string | null
          handedness?: Database["public"]["Enums"]["Handedness"] | null
          hasChildren?: string | null
          hasVisionCorrection?: boolean
          hdlm?: string | null
          id?: number
          isDeceased?: boolean
          isSmoker?: boolean
          lastName: string
          maritalStatus?: Database["public"]["Enums"]["MaritalStatus"] | null
          occupation?: string | null
          ophtalmologistName?: string | null
          osteopathId: number
          phone?: string | null
          physicalActivity?: string | null
          rheumatologicalHistory?: string | null
          surgicalHistory?: string | null
          traumaHistory?: string | null
          updatedAt: string
          userId?: string | null
        }
        Update: {
          address?: string | null
          avatarUrl?: string | null
          birthDate?: string | null
          cabinetId?: number | null
          childrenAges?: number[] | null
          contraception?: Database["public"]["Enums"]["Contraception"] | null
          createdAt?: string
          currentTreatment?: string | null
          digestiveDoctorName?: string | null
          digestiveProblems?: string | null
          email?: string | null
          entDoctorName?: string | null
          entProblems?: string | null
          firstName?: string
          gender?: Database["public"]["Enums"]["Gender"] | null
          generalPractitioner?: string | null
          handedness?: Database["public"]["Enums"]["Handedness"] | null
          hasChildren?: string | null
          hasVisionCorrection?: boolean
          hdlm?: string | null
          id?: number
          isDeceased?: boolean
          isSmoker?: boolean
          lastName?: string
          maritalStatus?: Database["public"]["Enums"]["MaritalStatus"] | null
          occupation?: string | null
          ophtalmologistName?: string | null
          osteopathId?: number
          phone?: string | null
          physicalActivity?: string | null
          rheumatologicalHistory?: string | null
          surgicalHistory?: string | null
          traumaHistory?: string | null
          updatedAt?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patient_cabinet"
            columns: ["cabinetId"]
            isOneToOne: false
            referencedRelation: "Cabinet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patient_osteopath"
            columns: ["osteopathId"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Patient_cabinetId_fkey"
            columns: ["cabinetId"]
            isOneToOne: false
            referencedRelation: "Cabinet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Patient_osteopathId_fkey"
            columns: ["osteopathId"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
        ]
      }
      TreatmentHistory: {
        Row: {
          consultationId: number
          date: string
          description: string
          id: number
        }
        Insert: {
          consultationId: number
          date?: string
          description: string
          id?: number
        }
        Update: {
          consultationId?: number
          date?: string
          description?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_treatmenthistory_consultation"
            columns: ["consultationId"]
            isOneToOne: false
            referencedRelation: "Consultation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TreatmentHistory_consultationId_fkey"
            columns: ["consultationId"]
            isOneToOne: false
            referencedRelation: "Consultation"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          osteopathId: number | null
          role: Database["public"]["Enums"]["Role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          osteopathId?: number | null
          role: Database["public"]["Enums"]["Role"]
          updated_at: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          osteopathId?: number | null
          role?: Database["public"]["Enums"]["Role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_osteopath"
            columns: ["osteopathId"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AppointmentStatus:
        | "SCHEDULED"
        | "COMPLETED"
        | "CANCELED"
        | "NO_SHOW"
        | "RESCHEDULED"
      Contraception:
        | "NONE"
        | "PILLS"
        | "CONDOM"
        | "IMPLANTS"
        | "DIAPHRAGM"
        | "IUD"
        | "INJECTION"
        | "PATCH"
        | "RING"
        | "NATURAL_METHODS"
        | "STERILIZATION"
      Gender: "Homme" | "Femme"
      Handedness: "LEFT" | "RIGHT" | "AMBIDEXTROUS"
      MaritalStatus:
        | "SINGLE"
        | "MARRIED"
        | "DIVORCED"
        | "WIDOWED"
        | "SEPARATED"
        | "ENGAGED"
        | "PARTNERED"
      PaymentStatus: "PAID" | "PENDING" | "CANCELED"
      Role: "ADMIN" | "OSTEOPATH"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

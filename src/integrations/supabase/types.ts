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
      Appointment: {
        Row: {
          cabinetId: number | null
          createdAt: string
          date: string
          id: number
          notes: string | null
          notificationSent: boolean
          osteopathId: number
          patientId: number
          reason: string
          status: Database["public"]["Enums"]["AppointmentStatus"]
          updatedAt: string
          user_id: string | null
        }
        Insert: {
          cabinetId?: number | null
          createdAt?: string
          date: string
          id?: number
          notes?: string | null
          notificationSent?: boolean
          osteopathId: number
          patientId: number
          reason: string
          status: Database["public"]["Enums"]["AppointmentStatus"]
          updatedAt?: string
          user_id?: string | null
        }
        Update: {
          cabinetId?: number | null
          createdAt?: string
          date?: string
          id?: number
          notes?: string | null
          notificationSent?: boolean
          osteopathId?: number
          patientId?: number
          reason?: string
          status?: Database["public"]["Enums"]["AppointmentStatus"]
          updatedAt?: string
          user_id?: string | null
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
            foreignKeyName: "fk_appointment_cabinet"
            columns: ["cabinetId"]
            isOneToOne: false
            referencedRelation: "Cabinet"
            referencedColumns: ["id"]
          },
        ]
      }
      Cabinet: {
        Row: {
          address: string
          createdAt: string
          email: string | null
          id: number
          imageUrl: string | null
          logoUrl: string | null
          name: string
          osteopathId: number
          phone: string | null
          professionalProfileId: number | null
          tenant_id: string | null
          updatedAt: string
        }
        Insert: {
          address: string
          createdAt?: string
          email?: string | null
          id?: number
          imageUrl?: string | null
          logoUrl?: string | null
          name: string
          osteopathId: number
          phone?: string | null
          professionalProfileId?: number | null
          tenant_id?: string | null
          updatedAt?: string
        }
        Update: {
          address?: string
          createdAt?: string
          email?: string | null
          id?: number
          imageUrl?: string | null
          logoUrl?: string | null
          name?: string
          osteopathId?: number
          phone?: string | null
          professionalProfileId?: number | null
          tenant_id?: string | null
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
            foreignKeyName: "Cabinet_professionalProfileId_fkey"
            columns: ["professionalProfileId"]
            isOneToOne: false
            referencedRelation: "ProfessionalProfile"
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
        ]
      }
      Invoice: {
        Row: {
          amount: number
          appointmentId: number | null
          cabinetId: number | null
          createdAt: string | null
          date: string
          id: number
          notes: string | null
          patientId: number
          paymentMethod: string | null
          paymentStatus: Database["public"]["Enums"]["PaymentStatus"]
          tvaExoneration: boolean | null
          tvaMotif: string | null
          updatedAt: string | null
        }
        Insert: {
          amount: number
          appointmentId?: number | null
          cabinetId?: number | null
          createdAt?: string | null
          date?: string
          id?: number
          notes?: string | null
          patientId: number
          paymentMethod?: string | null
          paymentStatus?: Database["public"]["Enums"]["PaymentStatus"]
          tvaExoneration?: boolean | null
          tvaMotif?: string | null
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          appointmentId?: number | null
          cabinetId?: number | null
          createdAt?: string | null
          date?: string
          id?: number
          notes?: string | null
          patientId?: number
          paymentMethod?: string | null
          paymentStatus?: Database["public"]["Enums"]["PaymentStatus"]
          tvaExoneration?: boolean | null
          tvaMotif?: string | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Invoice_appointmentId_fkey"
            columns: ["appointmentId"]
            isOneToOne: false
            referencedRelation: "Appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Invoice_cabinetId_fkey"
            columns: ["cabinetId"]
            isOneToOne: false
            referencedRelation: "Cabinet"
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
          adeli_number: string | null
          ape_code: string | null
          authId: string | null
          createdAt: string
          id: number
          name: string
          professional_title: string | null
          siret: string | null
          stampUrl: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          adeli_number?: string | null
          ape_code?: string | null
          authId?: string | null
          createdAt?: string
          id?: number
          name: string
          professional_title?: string | null
          siret?: string | null
          stampUrl?: string | null
          updatedAt?: string
          userId: string
        }
        Update: {
          adeli_number?: string | null
          ape_code?: string | null
          authId?: string | null
          createdAt?: string
          id?: number
          name?: string
          professional_title?: string | null
          siret?: string | null
          stampUrl?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
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
          alcoholConsumption: string | null
          allergies: string | null
          apgar_score: string | null
          avatarUrl: string | null
          behavior: string | null
          birthDate: string | null
          birthDetails: string | null
          bmi: number | null
          cabinetId: number | null
          childcare_type: string | null
          childCareContext: string | null
          childrenAges: number[] | null
          city: string | null
          complementaryExams: string | null
          contraception: Database["public"]["Enums"]["Contraception"] | null
          country: string | null
          createdAt: string
          currentMedication: string | null
          currentTreatment: string | null
          dental_health: string | null
          developmentMilestones: string | null
          digestiveDoctorName: string | null
          digestiveProblems: string | null
          email: string | null
          ent_followup: string | null
          entDoctorName: string | null
          entProblems: string | null
          familyStatus: string | null
          feeding: string | null
          fine_motor_skills: string | null
          firstName: string
          fracture_history: string | null
          gender: Database["public"]["Enums"]["Gender"] | null
          generalPractitioner: string | null
          generalSymptoms: string | null
          gross_motor_skills: string | null
          gynecological_history: string | null
          handedness: Database["public"]["Enums"]["Handedness"] | null
          hasChildren: string | null
          hasVisionCorrection: boolean
          hdlm: string | null
          head_circumference: number | null
          height: number | null
          height_at_birth: number | null
          id: number
          intestinal_transit: string | null
          isDeceased: boolean
          isExSmoker: boolean | null
          isSmoker: boolean
          job: string | null
          lastName: string
          maritalStatus: Database["public"]["Enums"]["MaritalStatus"] | null
          medicalHistory: string | null
          notes: string | null
          occupation: string | null
          ophtalmologistName: string | null
          osteopathId: number
          other_comments_adult: string | null
          other_comments_child: string | null
          otherContraception: string | null
          paramedical_followup: string | null
          pediatrician_name: string | null
          phone: string | null
          physicalActivity: string | null
          postalCode: string | null
          pregnancyHistory: string | null
          quitSmokingDate: string | null
          rheumatologicalHistory: string | null
          school_grade: string | null
          sleep_quality: string | null
          sleepingPattern: string | null
          smoker: boolean | null
          smokerSince: number | null
          smokingAmount: string | null
          smokingSince: string | null
          sport_frequency: string | null
          sportActivity: string | null
          surgicalHistory: string | null
          traumaHistory: string | null
          updatedAt: string
          userId: string | null
          weight: number | null
          weight_at_birth: number | null
        }
        Insert: {
          address?: string | null
          alcoholConsumption?: string | null
          allergies?: string | null
          apgar_score?: string | null
          avatarUrl?: string | null
          behavior?: string | null
          birthDate?: string | null
          birthDetails?: string | null
          bmi?: number | null
          cabinetId?: number | null
          childcare_type?: string | null
          childCareContext?: string | null
          childrenAges?: number[] | null
          city?: string | null
          complementaryExams?: string | null
          contraception?: Database["public"]["Enums"]["Contraception"] | null
          country?: string | null
          createdAt?: string
          currentMedication?: string | null
          currentTreatment?: string | null
          dental_health?: string | null
          developmentMilestones?: string | null
          digestiveDoctorName?: string | null
          digestiveProblems?: string | null
          email?: string | null
          ent_followup?: string | null
          entDoctorName?: string | null
          entProblems?: string | null
          familyStatus?: string | null
          feeding?: string | null
          fine_motor_skills?: string | null
          firstName: string
          fracture_history?: string | null
          gender?: Database["public"]["Enums"]["Gender"] | null
          generalPractitioner?: string | null
          generalSymptoms?: string | null
          gross_motor_skills?: string | null
          gynecological_history?: string | null
          handedness?: Database["public"]["Enums"]["Handedness"] | null
          hasChildren?: string | null
          hasVisionCorrection?: boolean
          hdlm?: string | null
          head_circumference?: number | null
          height?: number | null
          height_at_birth?: number | null
          id?: number
          intestinal_transit?: string | null
          isDeceased?: boolean
          isExSmoker?: boolean | null
          isSmoker?: boolean
          job?: string | null
          lastName: string
          maritalStatus?: Database["public"]["Enums"]["MaritalStatus"] | null
          medicalHistory?: string | null
          notes?: string | null
          occupation?: string | null
          ophtalmologistName?: string | null
          osteopathId: number
          other_comments_adult?: string | null
          other_comments_child?: string | null
          otherContraception?: string | null
          paramedical_followup?: string | null
          pediatrician_name?: string | null
          phone?: string | null
          physicalActivity?: string | null
          postalCode?: string | null
          pregnancyHistory?: string | null
          quitSmokingDate?: string | null
          rheumatologicalHistory?: string | null
          school_grade?: string | null
          sleep_quality?: string | null
          sleepingPattern?: string | null
          smoker?: boolean | null
          smokerSince?: number | null
          smokingAmount?: string | null
          smokingSince?: string | null
          sport_frequency?: string | null
          sportActivity?: string | null
          surgicalHistory?: string | null
          traumaHistory?: string | null
          updatedAt?: string
          userId?: string | null
          weight?: number | null
          weight_at_birth?: number | null
        }
        Update: {
          address?: string | null
          alcoholConsumption?: string | null
          allergies?: string | null
          apgar_score?: string | null
          avatarUrl?: string | null
          behavior?: string | null
          birthDate?: string | null
          birthDetails?: string | null
          bmi?: number | null
          cabinetId?: number | null
          childcare_type?: string | null
          childCareContext?: string | null
          childrenAges?: number[] | null
          city?: string | null
          complementaryExams?: string | null
          contraception?: Database["public"]["Enums"]["Contraception"] | null
          country?: string | null
          createdAt?: string
          currentMedication?: string | null
          currentTreatment?: string | null
          dental_health?: string | null
          developmentMilestones?: string | null
          digestiveDoctorName?: string | null
          digestiveProblems?: string | null
          email?: string | null
          ent_followup?: string | null
          entDoctorName?: string | null
          entProblems?: string | null
          familyStatus?: string | null
          feeding?: string | null
          fine_motor_skills?: string | null
          firstName?: string
          fracture_history?: string | null
          gender?: Database["public"]["Enums"]["Gender"] | null
          generalPractitioner?: string | null
          generalSymptoms?: string | null
          gross_motor_skills?: string | null
          gynecological_history?: string | null
          handedness?: Database["public"]["Enums"]["Handedness"] | null
          hasChildren?: string | null
          hasVisionCorrection?: boolean
          hdlm?: string | null
          head_circumference?: number | null
          height?: number | null
          height_at_birth?: number | null
          id?: number
          intestinal_transit?: string | null
          isDeceased?: boolean
          isExSmoker?: boolean | null
          isSmoker?: boolean
          job?: string | null
          lastName?: string
          maritalStatus?: Database["public"]["Enums"]["MaritalStatus"] | null
          medicalHistory?: string | null
          notes?: string | null
          occupation?: string | null
          ophtalmologistName?: string | null
          osteopathId?: number
          other_comments_adult?: string | null
          other_comments_child?: string | null
          otherContraception?: string | null
          paramedical_followup?: string | null
          pediatrician_name?: string | null
          phone?: string | null
          physicalActivity?: string | null
          postalCode?: string | null
          pregnancyHistory?: string | null
          quitSmokingDate?: string | null
          rheumatologicalHistory?: string | null
          school_grade?: string | null
          sleep_quality?: string | null
          sleepingPattern?: string | null
          smoker?: boolean | null
          smokerSince?: number | null
          smokingAmount?: string | null
          smokingSince?: string | null
          sport_frequency?: string | null
          sportActivity?: string | null
          surgicalHistory?: string | null
          traumaHistory?: string | null
          updatedAt?: string
          userId?: string | null
          weight?: number | null
          weight_at_birth?: number | null
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
      ProfessionalProfile: {
        Row: {
          adeli_number: string | null
          ape_code: string | null
          createdAt: string
          id: number
          name: string
          profession_type: string | null
          siret: string | null
          title: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          adeli_number?: string | null
          ape_code?: string | null
          createdAt?: string
          id?: number
          name: string
          profession_type?: string | null
          siret?: string | null
          title?: string | null
          updatedAt?: string
          userId: string
        }
        Update: {
          adeli_number?: string | null
          ape_code?: string | null
          createdAt?: string
          id?: number
          name?: string
          profession_type?: string | null
          siret?: string | null
          title?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: []
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
          auth_id: string | null
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
          auth_id?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          osteopathId?: number | null
          role?: Database["public"]["Enums"]["Role"]
          updated_at: string
        }
        Update: {
          auth_id?: string | null
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
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
        | "IUD_HORMONAL"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      AppointmentStatus: [
        "SCHEDULED",
        "COMPLETED",
        "CANCELED",
        "NO_SHOW",
        "RESCHEDULED",
      ],
      Contraception: [
        "NONE",
        "PILLS",
        "CONDOM",
        "IMPLANTS",
        "DIAPHRAGM",
        "IUD",
        "INJECTION",
        "PATCH",
        "RING",
        "NATURAL_METHODS",
        "STERILIZATION",
        "IUD_HORMONAL",
      ],
      Gender: ["Homme", "Femme"],
      Handedness: ["LEFT", "RIGHT", "AMBIDEXTROUS"],
      MaritalStatus: [
        "SINGLE",
        "MARRIED",
        "DIVORCED",
        "WIDOWED",
        "SEPARATED",
        "ENGAGED",
        "PARTNERED",
      ],
      PaymentStatus: ["PAID", "PENDING", "CANCELED"],
      Role: ["ADMIN", "OSTEOPATH"],
    },
  },
} as const

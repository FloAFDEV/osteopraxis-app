export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      cabinet_invitations: {
        Row: {
          cabinet_id: number
          created_at: string | null
          email: string | null
          expires_at: string
          id: string
          invitation_code: string
          inviter_osteopath_id: number
          notes: string | null
          used_at: string | null
          used_by_osteopath_id: number | null
        }
        Insert: {
          cabinet_id: number
          created_at?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          invitation_code?: string
          inviter_osteopath_id: number
          notes?: string | null
          used_at?: string | null
          used_by_osteopath_id?: number | null
        }
        Update: {
          cabinet_id?: number
          created_at?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          invitation_code?: string
          inviter_osteopath_id?: number
          notes?: string | null
          used_at?: string | null
          used_by_osteopath_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cabinet_invitations_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "Cabinet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cabinet_invitations_inviter_osteopath_id_fkey"
            columns: ["inviter_osteopath_id"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cabinet_invitations_used_by_osteopath_id_fkey"
            columns: ["used_by_osteopath_id"]
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
        ]
      }
      google_calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          google_event_id: string
          id: string
          last_modified: string | null
          location: string | null
          osteopath_id: number
          start_time: string
          status: string | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          google_event_id: string
          id?: string
          last_modified?: string | null
          location?: string | null
          osteopath_id: number
          start_time: string
          status?: string | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          google_event_id?: string
          id?: string
          last_modified?: string | null
          location?: string | null
          osteopath_id?: number
          start_time?: string
          status?: string | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_events_osteopath_id_fkey"
            columns: ["osteopath_id"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          osteopath_id: number
          refresh_token: string
          scope: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          osteopath_id: number
          refresh_token: string
          scope: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          osteopath_id?: number
          refresh_token?: string
          scope?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_tokens_osteopath_id_fkey"
            columns: ["osteopath_id"]
            isOneToOne: true
            referencedRelation: "Osteopath"
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
          osteopathId: number | null
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
          osteopathId?: number | null
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
          osteopathId?: number | null
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
            foreignKeyName: "Invoice_osteopathId_fkey"
            columns: ["osteopathId"]
            isOneToOne: false
            referencedRelation: "Osteopath"
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
          ape_code: string | null
          authId: string
          createdAt: string
          id: number
          name: string
          professional_title: string | null
          rpps_number: string | null
          siret: string | null
          stampUrl: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          ape_code?: string | null
          authId: string
          createdAt?: string
          id?: number
          name: string
          professional_title?: string | null
          rpps_number?: string | null
          siret?: string | null
          stampUrl?: string | null
          updatedAt?: string
          userId: string
        }
        Update: {
          ape_code?: string | null
          authId?: string
          createdAt?: string
          id?: number
          name?: string
          professional_title?: string | null
          rpps_number?: string | null
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
      osteopath_cabinet: {
        Row: {
          cabinet_id: number
          created_at: string | null
          id: number
          osteopath_id: number
        }
        Insert: {
          cabinet_id: number
          created_at?: string | null
          id?: number
          osteopath_id: number
        }
        Update: {
          cabinet_id?: number
          created_at?: string | null
          id?: number
          osteopath_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "osteopath_cabinet_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "Cabinet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "osteopath_cabinet_osteopath_id_fkey"
            columns: ["osteopath_id"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
        ]
      }
      osteopath_replacement: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: number
          is_active: boolean | null
          notes: string | null
          osteopath_id: number
          replacement_osteopath_id: number
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: number
          is_active?: boolean | null
          notes?: string | null
          osteopath_id: number
          replacement_osteopath_id: number
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: number
          is_active?: boolean | null
          notes?: string | null
          osteopath_id?: number
          replacement_osteopath_id?: number
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "osteopath_replacement_osteopath_id_fkey"
            columns: ["osteopath_id"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "osteopath_replacement_replacement_osteopath_id_fkey"
            columns: ["replacement_osteopath_id"]
            isOneToOne: false
            referencedRelation: "Osteopath"
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
          cardiac_history: string | null
          childcare_type: string | null
          childCareContext: string | null
          childrenAges: number[] | null
          city: string | null
          complementaryExams: string | null
          consultation_conclusion: string | null
          contraception: Database["public"]["Enums"]["Contraception"] | null
          country: string | null
          cranial_exam: string | null
          cranial_membrane_exam: string | null
          cranial_nerve_exam: string | null
          createdAt: string
          currentMedication: string | null
          currentTreatment: string | null
          dental_exam: string | null
          dental_health: string | null
          developmentMilestones: string | null
          diagnosis: string | null
          digestiveDoctorName: string | null
          digestiveProblems: string | null
          email: string | null
          ent_followup: string | null
          entDoctorName: string | null
          entProblems: string | null
          facial_mask_exam: string | null
          familyStatus: string | null
          fascia_exam: string | null
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
          lmo_tests: string | null
          lower_limb_exam: string | null
          maritalStatus: Database["public"]["Enums"]["MaritalStatus"] | null
          medical_examination: string | null
          medicalHistory: string | null
          musculoskeletal_history: string | null
          neurodevelopmental_history: string | null
          neurological_history: string | null
          notes: string | null
          occupation: string | null
          ophtalmologistName: string | null
          osteopathId: number
          other_comments_adult: string | null
          other_comments_child: string | null
          otherContraception: string | null
          paramedical_followup: string | null
          pediatrician_name: string | null
          pelvic_history: string | null
          phone: string | null
          physicalActivity: string | null
          postalCode: string | null
          pregnancyHistory: string | null
          pulmonary_history: string | null
          quitSmokingDate: string | null
          rheumatologicalHistory: string | null
          school_grade: string | null
          scoliosis: string | null
          shoulder_exam: string | null
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
          treatment_plan: string | null
          updatedAt: string
          upper_limb_exam: string | null
          userId: string | null
          vascular_exam: string | null
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
          cardiac_history?: string | null
          childcare_type?: string | null
          childCareContext?: string | null
          childrenAges?: number[] | null
          city?: string | null
          complementaryExams?: string | null
          consultation_conclusion?: string | null
          contraception?: Database["public"]["Enums"]["Contraception"] | null
          country?: string | null
          cranial_exam?: string | null
          cranial_membrane_exam?: string | null
          cranial_nerve_exam?: string | null
          createdAt?: string
          currentMedication?: string | null
          currentTreatment?: string | null
          dental_exam?: string | null
          dental_health?: string | null
          developmentMilestones?: string | null
          diagnosis?: string | null
          digestiveDoctorName?: string | null
          digestiveProblems?: string | null
          email?: string | null
          ent_followup?: string | null
          entDoctorName?: string | null
          entProblems?: string | null
          facial_mask_exam?: string | null
          familyStatus?: string | null
          fascia_exam?: string | null
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
          lmo_tests?: string | null
          lower_limb_exam?: string | null
          maritalStatus?: Database["public"]["Enums"]["MaritalStatus"] | null
          medical_examination?: string | null
          medicalHistory?: string | null
          musculoskeletal_history?: string | null
          neurodevelopmental_history?: string | null
          neurological_history?: string | null
          notes?: string | null
          occupation?: string | null
          ophtalmologistName?: string | null
          osteopathId: number
          other_comments_adult?: string | null
          other_comments_child?: string | null
          otherContraception?: string | null
          paramedical_followup?: string | null
          pediatrician_name?: string | null
          pelvic_history?: string | null
          phone?: string | null
          physicalActivity?: string | null
          postalCode?: string | null
          pregnancyHistory?: string | null
          pulmonary_history?: string | null
          quitSmokingDate?: string | null
          rheumatologicalHistory?: string | null
          school_grade?: string | null
          scoliosis?: string | null
          shoulder_exam?: string | null
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
          treatment_plan?: string | null
          updatedAt?: string
          upper_limb_exam?: string | null
          userId?: string | null
          vascular_exam?: string | null
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
          cardiac_history?: string | null
          childcare_type?: string | null
          childCareContext?: string | null
          childrenAges?: number[] | null
          city?: string | null
          complementaryExams?: string | null
          consultation_conclusion?: string | null
          contraception?: Database["public"]["Enums"]["Contraception"] | null
          country?: string | null
          cranial_exam?: string | null
          cranial_membrane_exam?: string | null
          cranial_nerve_exam?: string | null
          createdAt?: string
          currentMedication?: string | null
          currentTreatment?: string | null
          dental_exam?: string | null
          dental_health?: string | null
          developmentMilestones?: string | null
          diagnosis?: string | null
          digestiveDoctorName?: string | null
          digestiveProblems?: string | null
          email?: string | null
          ent_followup?: string | null
          entDoctorName?: string | null
          entProblems?: string | null
          facial_mask_exam?: string | null
          familyStatus?: string | null
          fascia_exam?: string | null
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
          lmo_tests?: string | null
          lower_limb_exam?: string | null
          maritalStatus?: Database["public"]["Enums"]["MaritalStatus"] | null
          medical_examination?: string | null
          medicalHistory?: string | null
          musculoskeletal_history?: string | null
          neurodevelopmental_history?: string | null
          neurological_history?: string | null
          notes?: string | null
          occupation?: string | null
          ophtalmologistName?: string | null
          osteopathId?: number
          other_comments_adult?: string | null
          other_comments_child?: string | null
          otherContraception?: string | null
          paramedical_followup?: string | null
          pediatrician_name?: string | null
          pelvic_history?: string | null
          phone?: string | null
          physicalActivity?: string | null
          postalCode?: string | null
          pregnancyHistory?: string | null
          pulmonary_history?: string | null
          quitSmokingDate?: string | null
          rheumatologicalHistory?: string | null
          school_grade?: string | null
          scoliosis?: string | null
          shoulder_exam?: string | null
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
          treatment_plan?: string | null
          updatedAt?: string
          upper_limb_exam?: string | null
          userId?: string | null
          vascular_exam?: string | null
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
      Quote: {
        Row: {
          amount: number
          cabinetId: number | null
          createdAt: string
          description: string | null
          id: number
          notes: string | null
          osteopathId: number
          patientId: number
          status: string
          title: string
          updatedAt: string
          validUntil: string
        }
        Insert: {
          amount?: number
          cabinetId?: number | null
          createdAt?: string
          description?: string | null
          id?: number
          notes?: string | null
          osteopathId: number
          patientId: number
          status?: string
          title: string
          updatedAt?: string
          validUntil: string
        }
        Update: {
          amount?: number
          cabinetId?: number | null
          createdAt?: string
          description?: string | null
          id?: number
          notes?: string | null
          osteopathId?: number
          patientId?: number
          status?: string
          title?: string
          updatedAt?: string
          validUntil?: string
        }
        Relationships: [
          {
            foreignKeyName: "Quote_cabinetId_fkey"
            columns: ["cabinetId"]
            isOneToOne: false
            referencedRelation: "Cabinet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Quote_osteopathId_fkey"
            columns: ["osteopathId"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Quote_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
        ]
      }
      QuoteItem: {
        Row: {
          description: string
          id: number
          quantity: number
          quoteId: number
          total: number
          unitPrice: number
        }
        Insert: {
          description: string
          id?: number
          quantity?: number
          quoteId: number
          total?: number
          unitPrice?: number
        }
        Update: {
          description?: string
          id?: number
          quantity?: number
          quoteId?: number
          total?: number
          unitPrice?: number
        }
        Relationships: [
          {
            foreignKeyName: "QuoteItem_quoteId_fkey"
            columns: ["quoteId"]
            isOneToOne: false
            referencedRelation: "Quote"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          is_active: boolean | null
          max_cabinets: number | null
          max_patients: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_cabinets?: number | null
          max_patients?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_cabinets?: number | null
          max_patients?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
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
      usage_tracking: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value?: number
          period_end: string
          period_start: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          user_id?: string | null
        }
        Relationships: []
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
      are_google_tokens_expired: {
        Args: { p_osteopath_id: number }
        Returns: boolean
      }
      can_osteopath_access_patient: {
        Args: { osteopath_auth_id: string; patient_id: number }
        Returns: boolean
      }
      can_perform_action: {
        Args: { user_uuid: string; action_type: string }
        Returns: boolean
      }
      cleanup_old_google_calendar_events: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_recurring_appointments: {
        Args: { p_recurring_id: number; p_limit?: number }
        Returns: number
      }
      get_authorized_osteopaths: {
        Args: { current_osteopath_auth_id: string }
        Returns: {
          id: number
          name: string
          professional_title: string
          rpps_number: string
          siret: string
          access_type: string
        }[]
      }
      get_current_osteopath_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_osteopath_cabinets: {
        Args: { osteopath_auth_id: string }
        Returns: {
          cabinet_id: number
        }[]
      }
      get_subscription_limits: {
        Args: { user_uuid: string }
        Returns: {
          max_patients: number
          max_cabinets: number
          features: Json
          subscription_tier: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      use_cabinet_invitation: {
        Args: { p_invitation_code: string; p_osteopath_id: number }
        Returns: Json
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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

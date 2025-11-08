export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_data: Json | null
          related_user_id: string | null
          severity: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_data?: Json | null
          related_user_id?: string | null
          severity?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_data?: Json | null
          related_user_id?: string | null
          severity?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Appointment: {
        Row: {
          cabinetId: number | null
          createdAt: string
          date: string
          deleted_at: string | null
          deleted_by: string | null
          demo_expires_at: string | null
          id: number
          is_demo_data: boolean | null
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
          deleted_at?: string | null
          deleted_by?: string | null
          demo_expires_at?: string | null
          id?: number
          is_demo_data?: boolean | null
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
          deleted_at?: string | null
          deleted_by?: string | null
          demo_expires_at?: string | null
          id?: number
          is_demo_data?: boolean | null
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
            foreignKeyName: "Appointment_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      business_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number | null
          period_end: string | null
          period_start: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
        }
        Relationships: []
      }
      Cabinet: {
        Row: {
          address: string
          bic: string | null
          city: string | null
          country: string | null
          createdAt: string
          demo_expires_at: string | null
          email: string | null
          iban: string | null
          id: number
          imageUrl: string | null
          is_demo_data: boolean | null
          logoUrl: string | null
          name: string
          osteopathId: number
          phone: string | null
          postalCode: string | null
          professionalProfileId: number | null
          siret: string | null
          tenant_id: string | null
          updatedAt: string
          website: string | null
        }
        Insert: {
          address: string
          bic?: string | null
          city?: string | null
          country?: string | null
          createdAt?: string
          demo_expires_at?: string | null
          email?: string | null
          iban?: string | null
          id?: number
          imageUrl?: string | null
          is_demo_data?: boolean | null
          logoUrl?: string | null
          name: string
          osteopathId: number
          phone?: string | null
          postalCode?: string | null
          professionalProfileId?: number | null
          siret?: string | null
          tenant_id?: string | null
          updatedAt?: string
          website?: string | null
        }
        Update: {
          address?: string
          bic?: string | null
          city?: string | null
          country?: string | null
          createdAt?: string
          demo_expires_at?: string | null
          email?: string | null
          iban?: string | null
          id?: number
          imageUrl?: string | null
          is_demo_data?: boolean | null
          logoUrl?: string | null
          name?: string
          osteopathId?: number
          phone?: string | null
          postalCode?: string | null
          professionalProfileId?: number | null
          siret?: string | null
          tenant_id?: string | null
          updatedAt?: string
          website?: string | null
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
      cabinet_encryption_keys: {
        Row: {
          cabinet_id: number
          created_at: string | null
          created_by_osteopath_id: number
          id: string
          is_active: boolean | null
          key_hash: string
          key_version: number
        }
        Insert: {
          cabinet_id: number
          created_at?: string | null
          created_by_osteopath_id: number
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_version?: number
        }
        Update: {
          cabinet_id?: number
          created_at?: string | null
          created_by_osteopath_id?: number
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cabinet_encryption_keys_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "Cabinet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cabinet_encryption_keys_created_by_osteopath_id_fkey"
            columns: ["created_by_osteopath_id"]
            isOneToOne: false
            referencedRelation: "Osteopath"
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
      cabinet_patient_sync: {
        Row: {
          cabinet_id: number
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_sync_timestamp: string | null
          owner_osteopath_id: number
          patient_local_hash: string
          patient_sync_key_hash: string
          shared_with_osteopath_id: number
          sync_permission: string
          updated_at: string | null
        }
        Insert: {
          cabinet_id: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_timestamp?: string | null
          owner_osteopath_id: number
          patient_local_hash: string
          patient_sync_key_hash: string
          shared_with_osteopath_id: number
          sync_permission: string
          updated_at?: string | null
        }
        Update: {
          cabinet_id?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_timestamp?: string | null
          owner_osteopath_id?: number
          patient_local_hash?: string
          patient_sync_key_hash?: string
          shared_with_osteopath_id?: number
          sync_permission?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cabinet_patient_sync_cabinet_id_fkey"
            columns: ["cabinet_id"]
            isOneToOne: false
            referencedRelation: "Cabinet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cabinet_patient_sync_owner_osteopath_id_fkey"
            columns: ["owner_osteopath_id"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cabinet_patient_sync_shared_with_osteopath_id_fkey"
            columns: ["shared_with_osteopath_id"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
        ]
      }
      cabinet_sync_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          performed_by_osteopath_id: number
          sync_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          performed_by_osteopath_id: number
          sync_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          performed_by_osteopath_id?: number
          sync_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cabinet_sync_logs_performed_by_osteopath_id_fkey"
            columns: ["performed_by_osteopath_id"]
            isOneToOne: false
            referencedRelation: "Osteopath"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cabinet_sync_logs_sync_id_fkey"
            columns: ["sync_id"]
            isOneToOne: false
            referencedRelation: "cabinet_patient_sync"
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
      demo_sessions: {
        Row: {
          cleaned_up_at: string | null
          created_at: string | null
          data_types: string[] | null
          expires_at: string | null
          id: string
          is_demo: boolean | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          cleaned_up_at?: string | null
          created_at?: string | null
          data_types?: string[] | null
          expires_at?: string | null
          id?: string
          is_demo?: boolean | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          cleaned_up_at?: string | null
          created_at?: string | null
          data_types?: string[] | null
          expires_at?: string | null
          id?: string
          is_demo?: boolean | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
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
      hybrid_storage_unlock_requests: {
        Row: {
          applied_at: string | null
          created_at: string
          id: string
          method: string
          new_credential: string
          requested_by: string
          status: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          id?: string
          method: string
          new_credential: string
          requested_by?: string
          status?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          id?: string
          method?: string
          new_credential?: string
          requested_by?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      Invoice: {
        Row: {
          amount: number
          appointmentId: number | null
          cabinetId: number | null
          createdAt: string | null
          date: string
          deleted_at: string | null
          deleted_by: string | null
          demo_expires_at: string | null
          id: number
          is_demo_data: boolean | null
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
          deleted_at?: string | null
          deleted_by?: string | null
          demo_expires_at?: string | null
          id?: number
          is_demo_data?: boolean | null
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
          deleted_at?: string | null
          deleted_by?: string | null
          demo_expires_at?: string | null
          id?: number
          is_demo_data?: boolean | null
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
            foreignKeyName: "Invoice_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
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
          demo_expires_at: string | null
          id: number
          is_demo_data: boolean | null
          name: string
          plan: Database["public"]["Enums"]["subscription_tier"] | null
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
          demo_expires_at?: string | null
          id?: number
          is_demo_data?: boolean | null
          name: string
          plan?: Database["public"]["Enums"]["subscription_tier"] | null
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
          demo_expires_at?: string | null
          id?: number
          is_demo_data?: boolean | null
          name?: string
          plan?: Database["public"]["Enums"]["subscription_tier"] | null
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
          contraception_notes: string | null
          country: string | null
          cranial_exam: string | null
          cranial_membrane_exam: string | null
          cranial_nerve_exam: string | null
          createdAt: string
          currentMedication: string | null
          currentTreatment: string | null
          deleted_at: string | null
          deleted_by: string | null
          demo_expires_at: string | null
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
          is_demo_data: boolean | null
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
          relationship_other: string | null
          relationship_type: string | null
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
          contraception_notes?: string | null
          country?: string | null
          cranial_exam?: string | null
          cranial_membrane_exam?: string | null
          cranial_nerve_exam?: string | null
          createdAt?: string
          currentMedication?: string | null
          currentTreatment?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          demo_expires_at?: string | null
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
          is_demo_data?: boolean | null
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
          relationship_other?: string | null
          relationship_type?: string | null
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
          contraception_notes?: string | null
          country?: string | null
          cranial_exam?: string | null
          cranial_membrane_exam?: string | null
          cranial_nerve_exam?: string | null
          createdAt?: string
          currentMedication?: string | null
          currentTreatment?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          demo_expires_at?: string | null
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
          is_demo_data?: boolean | null
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
          relationship_other?: string | null
          relationship_type?: string | null
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
            foreignKeyName: "Patient_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
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
      patient_relationships: {
        Row: {
          created_at: string | null
          id: number
          patient_id: number
          related_patient_id: number
          relationship_notes: string | null
          relationship_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          patient_id: number
          related_patient_id: number
          relationship_notes?: string | null
          relationship_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          patient_id?: number
          related_patient_id?: number
          relationship_notes?: string | null
          relationship_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_relationships_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relationships_related_patient_id_fkey"
            columns: ["related_patient_id"]
            isOneToOne: false
            referencedRelation: "Patient"
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
        Relationships: [
          {
            foreignKeyName: "subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          is_active: boolean | null
          max_cabinets: number | null
          max_patients: number | null
          max_practitioners: number | null
          name: string
          plan_code: string | null
          price_monthly: number
          price_yearly: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          trial_days: number | null
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_cabinets?: number | null
          max_patients?: number | null
          max_practitioners?: number | null
          name: string
          plan_code?: string | null
          price_monthly: number
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          trial_days?: number | null
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_cabinets?: number | null
          max_patients?: number | null
          max_practitioners?: number | null
          name?: string
          plan_code?: string | null
          price_monthly?: number
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          trial_days?: number | null
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_unit: string | null
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_unit?: string | null
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          recorded_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      User: {
        Row: {
          auth_id: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          osteopathId: number | null
          role: Database["public"]["Enums"]["Role"]
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          osteopathId?: number | null
          role?: Database["public"]["Enums"]["Role"]
          updated_at: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
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
          {
            foreignKeyName: "User_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      user_roles_view: {
        Row: {
          email: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          role_assigned_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_access_with_audit: { Args: never; Returns: boolean }
      admin_cleanup_old_logs: { Args: { days_old?: number }; Returns: Json }
      admin_deactivate_cabinet: {
        Args: { cabinet_id: number }
        Returns: boolean
      }
      admin_find_patient_duplicates: {
        Args: never
        Returns: {
          birth_date: string
          email: string
          first_name: string
          group_id: number
          last_name: string
          patient_id: number
          phone: string
          similarity_score: number
        }[]
      }
      admin_generate_usage_report: { Args: never; Returns: Json }
      admin_get_cabinets_with_stats: {
        Args: never
        Returns: {
          active_patients_count: number
          address: string
          associated_osteopaths_count: number
          created_at: string
          deleted_at: string
          email: string
          id: number
          name: string
          owner_name: string
          owner_osteopath_id: number
          patients_count: number
          phone: string
          updated_at: string
        }[]
      }
      admin_get_detailed_stats: {
        Args: { period_type?: string; periods_count?: number }
        Returns: {
          active_users: number
          canceled_appointments: number
          completed_appointments: number
          error_count: number
          new_cabinets: number
          new_osteopaths: number
          new_patients: number
          new_users: number
          paid_invoices: number
          period_end: string
          period_label: string
          period_start: string
          total_appointments: number
          total_invoices: number
          total_revenue: number
        }[]
      }
      admin_get_error_logs: {
        Args: { limit_count?: number }
        Returns: {
          action: string
          error_details: Json
          level: string
          log_id: string
          log_timestamp: string
          message: string
          table_name: string
          user_id: string
        }[]
      }
      admin_get_monthly_stats: {
        Args: { month_filter?: number; year_filter?: number }
        Returns: {
          active_osteopaths: number
          active_patients: number
          canceled_appointments: number
          completed_appointments: number
          month_year: string
          new_patients: number
          total_appointments: number
          total_revenue: number
        }[]
      }
      admin_get_orphan_patients: {
        Args: never
        Returns: {
          cabinet_id: number
          cabinet_name: string
          created_at: string
          email: string
          first_name: string
          id: number
          issue_type: string
          last_name: string
          osteopath_id: number
          phone: string
        }[]
      }
      admin_get_osteopath_stats: {
        Args: never
        Returns: {
          active_patients: number
          avg_revenue_per_appointment: number
          completed_appointments: number
          last_activity_date: string
          osteopath_id: number
          osteopath_name: string
          total_appointments: number
          total_patients: number
          total_revenue: number
        }[]
      }
      admin_get_storage_usage: { Args: never; Returns: Json }
      admin_get_system_health: {
        Args: never
        Returns: {
          last_updated: string
          metric_name: string
          metric_type: string
          metric_value: string
          status: string
        }[]
      }
      admin_get_system_logs: {
        Args: {
          date_from?: string
          date_to?: string
          limit_count?: number
          log_level?: string
        }
        Returns: {
          action: string
          ip_address: unknown
          level: string
          log_id: string
          log_timestamp: string
          new_values: Json
          old_values: Json
          record_id: string
          success: boolean
          table_name: string
          user_agent: string
          user_email: string
          user_id: string
        }[]
      }
      admin_get_system_stats: {
        Args: never
        Returns: {
          active_patients: number
          active_users: number
          appointments_this_month: number
          avg_appointments_per_osteopath: number
          database_size: string
          paid_invoices: number
          system_revenue: number
          total_appointments: number
          total_cabinets: number
          total_invoices: number
          total_osteopaths: number
          total_patients: number
          total_users: number
        }[]
      }
      admin_optimize_performance: { Args: never; Returns: Json }
      admin_search_patients: {
        Args: {
          cabinet_filter?: number
          limit_count?: number
          osteopath_filter?: number
          search_term?: string
        }
        Returns: {
          cabinet_id: number
          cabinet_name: string
          created_at: string
          deleted_at: string
          email: string
          first_name: string
          id: number
          last_name: string
          osteopath_id: number
          osteopath_name: string
          phone: string
          updated_at: string
        }[]
      }
      are_google_tokens_expired: {
        Args: { p_osteopath_id: number }
        Returns: boolean
      }
      auto_optimize_system: { Args: never; Returns: number }
      can_access_patient_secure: {
        Args: { patient_id: number }
        Returns: boolean
      }
      can_osteopath_access_patient: {
        Args: { osteopath_auth_id: string; patient_id: number }
        Returns: boolean
      }
      can_perform_action: {
        Args: { action_type: string; user_uuid: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_max_requests?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_demo_data: { Args: never; Returns: number }
      cleanup_expired_demo_sessions: {
        Args: never
        Returns: {
          cleaned_appointments: number
          cleaned_patients: number
          cleaned_sessions: number
        }[]
      }
      cleanup_expired_syncs: { Args: never; Returns: number }
      cleanup_old_google_calendar_events: { Args: never; Returns: number }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      enhanced_cleanup_system: { Args: never; Returns: number }
      generate_invitation_code: { Args: never; Returns: string }
      generate_recurring_appointments: {
        Args: { p_limit?: number; p_recurring_id: number }
        Returns: number
      }
      get_authorized_osteopaths: {
        Args: { current_osteopath_auth_id: string }
        Returns: {
          access_type: string
          id: number
          name: string
          professional_title: string
          rpps_number: string
          siret: string
        }[]
      }
      get_current_osteopath_id: { Args: never; Returns: number }
      get_current_osteopath_id_debug: {
        Args: never
        Returns: {
          auth_uid: string
          error_message: string
          osteopath_id: number
        }[]
      }
      get_current_osteopath_id_secure: { Args: never; Returns: number }
      get_current_osteopath_plan: {
        Args: never
        Returns: Database["public"]["Enums"]["subscription_tier"]
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
          features: Json
          max_cabinets: number
          max_patients: number
          subscription_tier: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { uid: string }; Returns: boolean }
      is_admin_secure: { Args: never; Returns: boolean }
      is_admin_user: { Args: { user_id: string }; Returns: boolean }
      log_audit_action: {
        Args: {
          p_action: string
          p_new_values?: Json
          p_old_values?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: undefined
      }
      promote_user_to_admin: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      record_metric: {
        Args: {
          p_metadata?: Json
          p_name: string
          p_unit?: string
          p_value: number
        }
        Returns: undefined
      }
      restore_record: {
        Args: { p_record_id: string; p_table_name: string }
        Returns: boolean
      }
      scheduled_cleanup: { Args: never; Returns: undefined }
      secure_cleanup_expired_data: { Args: never; Returns: number }
      security_health_check: {
        Args: never
        Returns: {
          critical: boolean
          details: string
          metric_name: string
          status: string
        }[]
      }
      soft_delete_record: {
        Args: { p_record_id: string; p_table_name: string }
        Returns: boolean
      }
      use_cabinet_invitation: {
        Args: { p_invitation_code: string; p_osteopath_id: number }
        Returns: Json
      }
      validate_email: { Args: { email: string }; Returns: boolean }
      validate_phone: { Args: { phone: string }; Returns: boolean }
      verify_admin_access: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "osteopath" | "user"
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
      subscription_tier: "light" | "full" | "pro"
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
      app_role: ["admin", "osteopath", "user"],
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
      subscription_tier: ["light", "full", "pro"],
    },
  },
} as const

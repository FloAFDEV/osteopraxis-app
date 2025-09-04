
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { api } from '@/services/api';

export interface GoogleCalendarEvent {
  id: string;
  google_event_id: string;
  summary: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  status: string;
  // Nouveaux champs pour la correspondance patient
  matched_patient_id?: number;
  matched_patient_name?: string;
  is_doctolib?: boolean;
}

export interface GoogleCalendarIntegration {
  isConnected: boolean;
  events: GoogleCalendarEvent[];
  isLoading: boolean;
  connectGoogle: () => Promise<void>;
  syncCalendar: () => Promise<void>;
  disconnectGoogle: () => Promise<void>;
  matchPatients: (events: GoogleCalendarEvent[]) => Promise<GoogleCalendarEvent[]>;
}

export function useGoogleCalendar(): GoogleCalendarIntegration {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Check if Google Calendar is connected
  const { data: tokenData } = useQuery({
    queryKey: ['google-calendar-tokens', user?.osteopathId],
    queryFn: async () => {
      if (!user?.osteopathId) return null;
      
      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('*')
        .eq('osteopath_id', user.osteopathId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking Google tokens:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.osteopathId,
  });

  useEffect(() => {
    setIsConnected(!!tokenData);
  }, [tokenData]);

  // Match Google Calendar events with patients
  const matchPatients = async (events: GoogleCalendarEvent[]): Promise<GoogleCalendarEvent[]> => {
    try {
      const patients = await api.getPatients();
      
      return events.map(event => {
        // Recherche par nom dans le titre ou la description
        const searchText = `${event.summary} ${event.description || ''}`.toLowerCase();
        
        // Patterns pour identifier les RDV Doctolib
        const doctolibPatterns = [
          /doctolib/i,
          /rdv/i,
          /consultation/i,
          /séance/i
        ];
        
        const isDoctolib = doctolibPatterns.some(pattern => pattern.test(searchText));
        
        // Recherche de correspondance patient
        let matchedPatient = null;
        
        for (const patient of patients) {
          const patientFullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
          const patientReverseName = `${patient.lastName} ${patient.firstName}`.toLowerCase();
          
          // Recherche exacte du nom complet
          if (searchText.includes(patientFullName) || searchText.includes(patientReverseName)) {
            matchedPatient = patient;
            break;
          }
          
          // Recherche par nom de famille seul
          if (searchText.includes(patient.lastName.toLowerCase()) && patient.lastName.length > 2) {
            matchedPatient = patient;
            break;
          }
        }
        
        return {
          ...event,
          matched_patient_id: matchedPatient?.id,
          matched_patient_name: matchedPatient ? `${matchedPatient.firstName} ${matchedPatient.lastName}` : undefined,
          is_doctolib: isDoctolib
        };
      });
    } catch (error) {
      console.error('Error matching patients:', error);
      return events;
    }
  };

  // Get Google Calendar events with patient matching
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['google-calendar-events', user?.osteopathId],
    queryFn: async () => {
      if (!isConnected) return [];

      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        method: 'GET',
      });

      if (error) {
        console.error('Error fetching Google Calendar events:', error);
        return [];
      }

      const rawEvents = data?.events || [];
      return await matchPatients(rawEvents);
    },
    enabled: isConnected && !!user?.osteopathId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Connect Google Calendar
  const connectMutation = useMutation({
    mutationFn: async () => {
      // Get OAuth URL
      const { data, error } = await supabase.functions.invoke('google-auth/url', {
        method: 'GET',
      });

      if (error || !data?.url) {
        throw new Error('Impossible de générer l\'URL d\'authentification Google');
      }

      // Redirect to Google OAuth
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error('Error connecting Google Calendar:', error);
      toast.error('Erreur lors de la connexion à Google Calendar');
    },
  });

  // Sync calendar events
  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        method: 'POST',
      });

      if (error) {
        throw new Error('Erreur lors de la synchronisation');
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalider les queries pour mettre à jour les événements
      queryClient.invalidateQueries({ queryKey: ['google-calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(`${data?.eventsProcessed || 0} événements synchronisés`);
    },
    onError: (error) => {
      console.error('Error syncing calendar:', error);
      toast.error('Erreur lors de la synchronisation du calendrier');
    },
  });

  // Disconnect Google Calendar
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!user?.osteopathId) return;

      const { error } = await supabase
        .from('google_calendar_tokens')
        .delete()
        .eq('osteopath_id', user.osteopathId);

      if (error) {
        throw new Error('Erreur lors de la déconnexion');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['google-calendar-events'] });
      setIsConnected(false);
      toast.success('Google Calendar déconnecté');
    },
    onError: (error) => {
      console.error('Error disconnecting Google Calendar:', error);
      toast.error('Erreur lors de la déconnexion');
    },
  });

  return {
    isConnected,
    events,
    isLoading,
    connectGoogle: connectMutation.mutateAsync,
    syncCalendar: syncMutation.mutateAsync,
    disconnectGoogle: disconnectMutation.mutateAsync,
    matchPatients,
  };
}

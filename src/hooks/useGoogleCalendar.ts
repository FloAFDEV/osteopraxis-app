
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface GoogleCalendarEvent {
  id: string;
  google_event_id: string;
  summary: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  status: string;
  patient_id?: number;
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface GoogleCalendarIntegration {
  isConnected: boolean;
  events: GoogleCalendarEvent[];
  isLoading: boolean;
  connectGoogle: () => Promise<void>;
  syncCalendar: () => Promise<void>;
  disconnectGoogle: () => Promise<void>;
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

  // Get Google Calendar events
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

      return data?.events || [];
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
      queryClient.invalidateQueries({ queryKey: ['google-calendar-events'] });
      const patientsMatched = data?.patientsMatched || 0;
      const total = data?.eventsProcessed || 0;
      toast.success(`${total} événements synchronisés${patientsMatched > 0 ? ` (${patientsMatched} patients identifiés)` : ''}`);
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
  };
}

import { supabase } from '@/integrations/supabase/client';
import { RecurringAppointment, CreateRecurringAppointmentPayload } from '@/types';

export class RecurringAppointmentService {
  
  async getRecurringAppointments(osteopathId: number): Promise<RecurringAppointment[]> {
    const { data, error } = await supabase
      .from('recurring_appointments')
      .select(`
        *,
        Patient:patient_id (
          firstName:first_name,
          lastName:last_name
        )
      `)
      .eq('osteopath_id', osteopathId)
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching recurring appointments:', error);
      throw error;
    }

    return data?.map(this.mapToRecurringAppointment) || [];
  }

  async getRecurringAppointmentById(id: number): Promise<RecurringAppointment | null> {
    const { data, error } = await supabase
      .from('recurring_appointments')
      .select(`
        *,
        Patient:patient_id (
          firstName:first_name,
          lastName:last_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching recurring appointment:', error);
      throw error;
    }

    return data ? this.mapToRecurringAppointment(data) : null;
  }

  async createRecurringAppointment(payload: CreateRecurringAppointmentPayload): Promise<RecurringAppointment> {
    const { data, error } = await supabase
      .from('recurring_appointments')
      .insert({
        osteopath_id: payload.osteopathId,
        patient_id: payload.patientId,
        cabinet_id: payload.cabinetId,
        reason: payload.reason,
        notes: payload.notes,
        duration_minutes: payload.durationMinutes || 60,
        recurrence_type: payload.recurrenceType,
        recurrence_interval: payload.recurrenceInterval || 1,
        start_date: payload.startDate,
        end_date: payload.endDate,
        max_occurrences: payload.maxOccurrences,
        start_time: payload.startTime,
        weekdays: payload.weekdays,
        monthly_day: payload.monthlyDay,
        exceptions: payload.exceptions || [],
        is_active: true,
      })
      .select(`
        *,
        Patient:patient_id (
          firstName:first_name,
          lastName:last_name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating recurring appointment:', error);
      throw error;
    }

    return this.mapToRecurringAppointment(data);
  }

  async updateRecurringAppointment(id: number, payload: Partial<CreateRecurringAppointmentPayload>): Promise<RecurringAppointment> {
    const { data, error } = await supabase
      .from('recurring_appointments')
      .update({
        patient_id: payload.patientId,
        cabinet_id: payload.cabinetId,
        reason: payload.reason,
        notes: payload.notes,
        duration_minutes: payload.durationMinutes,
        recurrence_type: payload.recurrenceType,
        recurrence_interval: payload.recurrenceInterval,
        start_date: payload.startDate,
        end_date: payload.endDate,
        max_occurrences: payload.maxOccurrences,
        start_time: payload.startTime,
        weekdays: payload.weekdays,
        monthly_day: payload.monthlyDay,
        exceptions: payload.exceptions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        Patient:patient_id (
          firstName:first_name,
          lastName:last_name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating recurring appointment:', error);
      throw error;
    }

    return this.mapToRecurringAppointment(data);
  }

  async deleteRecurringAppointment(id: number): Promise<void> {
    const { error } = await supabase
      .from('recurring_appointments')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting recurring appointment:', error);
      throw error;
    }
  }

  async generateAppointments(recurringId: number, limit: number = 10): Promise<number> {
    const { data, error } = await supabase.rpc('generate_recurring_appointments', {
      p_recurring_id: recurringId,
      p_limit: limit
    });

    if (error) {
      console.error('Error generating appointments:', error);
      throw error;
    }

    return data || 0;
  }

  async addException(id: number, exceptionDate: string): Promise<void> {
    const recurring = await this.getRecurringAppointmentById(id);
    if (!recurring) {
      throw new Error('Recurring appointment not found');
    }

    const newExceptions = [...recurring.exceptions, exceptionDate];
    
    await this.updateRecurringAppointment(id, {
      exceptions: newExceptions
    });
  }

  async removeException(id: number, exceptionDate: string): Promise<void> {
    const recurring = await this.getRecurringAppointmentById(id);
    if (!recurring) {
      throw new Error('Recurring appointment not found');
    }

    const newExceptions = recurring.exceptions.filter(date => date !== exceptionDate);
    
    await this.updateRecurringAppointment(id, {
      exceptions: newExceptions
    });
  }

  getRecurrenceDescription(recurring: RecurringAppointment): string {
    const { recurrenceType, recurrenceInterval, weekdays } = recurring;
    
    let description = '';
    
    switch (recurrenceType) {
      case 'daily':
        description = recurrenceInterval === 1 ? 'Tous les jours' : `Tous les ${recurrenceInterval} jours`;
        break;
      case 'weekly':
        if (weekdays && weekdays.length > 0) {
          const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
          const selectedDays = weekdays.map(day => dayNames[day]).join(', ');
          description = recurrenceInterval === 1 
            ? `Chaque semaine (${selectedDays})`
            : `Toutes les ${recurrenceInterval} semaines (${selectedDays})`;
        } else {
          description = recurrenceInterval === 1 ? 'Chaque semaine' : `Toutes les ${recurrenceInterval} semaines`;
        }
        break;
      case 'biweekly':
        description = 'Tous les 15 jours';
        break;
      case 'monthly':
        description = recurrenceInterval === 1 ? 'Chaque mois' : `Tous les ${recurrenceInterval} mois`;
        break;
    }
    
    return description;
  }

  private mapToRecurringAppointment(data: any): RecurringAppointment {
    return {
      id: data.id,
      osteopathId: data.osteopath_id,
      patientId: data.patient_id,
      cabinetId: data.cabinet_id,
      reason: data.reason,
      notes: data.notes,
      durationMinutes: data.duration_minutes,
      recurrenceType: data.recurrence_type,
      recurrenceInterval: data.recurrence_interval,
      startDate: data.start_date,
      endDate: data.end_date,
      maxOccurrences: data.max_occurrences,
      startTime: data.start_time,
      weekdays: data.weekdays,
      monthlyDay: data.monthly_day,
      exceptions: data.exceptions || [],
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      Patient: data.Patient ? {
        firstName: data.Patient.firstName,
        lastName: data.Patient.lastName,
      } : undefined,
    };
  }
}

export const recurringAppointmentService = new RecurringAppointmentService();
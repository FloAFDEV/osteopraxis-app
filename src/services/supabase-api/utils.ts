
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { SIMULATE_AUTH } from '../api/config';

// Importer le client depuis le fichier généré
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Exporter le client
export const supabase = supabaseClient;

// Type utilitaire pour les données typées
export const typedData = <T>(data: any): T => data as T;

// Fonction utilitaire pour ajouter des en-têtes d'authentification simulés
export const addAuthHeaders = <T extends { setHeader: (name: string, value: string) => T }>(query: T): T => {
  if (SIMULATE_AUTH) {
    return query.setHeader('X-Development-Mode', 'true');
  }
  return query;
};

// Helper function to check auth state before operations
export const checkAuth = () => {
  const session = supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }
  return session;
};

// Récupérer un type enum à partir d'une valeur string
export function getEnumValue<T extends string>(value: string, allowedValues: readonly T[]): T {
  if (allowedValues.includes(value as T)) {
    return value as T;
  }
  throw new Error(`Invalid enum value: ${value}. Allowed values are: ${allowedValues.join(', ')}`);
}

// AppointmentStatus enum helper - Correction de CANCELLED à CANCELED pour correspondre au type dans types.ts
export const AppointmentStatusValues = ['SCHEDULED', 'COMPLETED', 'CANCELED', 'NO_SHOW', 'RESCHEDULED'] as const;
export type AppointmentStatusType = typeof AppointmentStatusValues[number];

// Contraception enum helper
export const ContraceptionValues = [
  'NONE', 'PILLS', 'PATCH', 'RING', 'IUD', 'IMPLANT', 
  'CONDOM', 'DIAPHRAGM', 'INJECTION', 'NATURAL_METHODS', 'STERILIZATION'
] as const;
export type ContraceptionType = typeof ContraceptionValues[number];

// Fonctions de sécurité pour s'assurer que les valeurs correspondent aux enum de Supabase
export function ensureAppointmentStatus(status: string): AppointmentStatusType {
  // Correction spéciale pour CANCELLED -> CANCELED
  if (status === 'CANCELLED') {
    return 'CANCELED';
  }
  return getEnumValue(status, AppointmentStatusValues);
}

export function ensureContraception(contraception: string): ContraceptionType {
  // Correction spéciale pour IMPLANTS -> IMPLANT
  if (contraception === 'IMPLANTS') {
    return 'IMPLANT';
  }
  return getEnumValue(contraception, ContraceptionValues);
}

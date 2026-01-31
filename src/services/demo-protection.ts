/**
 * 🛡️ Protection Mode Démo - Vérifie l'isolation des données
 * 
 * Ce module assure que le mode démo reste strictement isolé :
 * - Aucun accès Supabase
 * - Aucun accès aux cabinets réels
 * - Stockage limité à sessionStorage (3 heures)
 */

import { isDemoSession } from '@/utils/demo-detection';

/**
 * Vérification de sécurité pour empêcher l'accès Supabase en mode démo
 */
export async function ensureNotDemo(operation: string): Promise<void> {
  const isDemoMode = await isDemoSession();
  if (isDemoMode) {
    const error = `🚨 VIOLATION SÉCURITÉ DÉMO: Tentative d'accès ${operation} en mode démo`;
    console.error(error);
    throw new Error(error);
  }
}

/**
 * Wrapper de protection pour les services Supabase
 */
export function protectSupabaseService<T extends (...args: any[]) => any>(
  serviceName: string,
  serviceFunction: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    await ensureNotDemo(`service Supabase ${serviceName}`);
    return serviceFunction(...args);
  }) as T;
}

/**
 * Validation des données Cabinet en mode démo
 */
export function validateDemoCabinetAccess(cabinetId?: number): void {
  // En mode démo, seul le cabinet ID 1 (cabinet démo) est autorisé
  if (cabinetId && cabinetId !== 1) {
    throw new Error(
      `🎭 MODE DÉMO: Accès refusé au cabinet ${cabinetId}. ` +
      `Seul le cabinet démo (ID: 1) est disponible.`
    );
  }
}

/**
 * Message d'information pour les utilisateurs démonstration
 */
export const DEMO_CABINET_INFO = {
  name: "Cabinet de Démonstration",
  description: "Ce cabinet est fictif et conçu uniquement pour tester l'application",
  limitations: [
    "Aucune donnée réelle n'est stockée",
    "Les données disparaissent après 3 heures",
    "Un seul cabinet est disponible en mode démo",
    "Aucune modification du cabinet n'est possible"
  ]
} as const;
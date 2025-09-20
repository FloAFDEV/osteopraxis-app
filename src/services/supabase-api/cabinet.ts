/**
 * 🏢 Service Cabinet Supabase - STRICTEMENT INTERDIT EN MODE DÉMO
 * 
 * ⚠️ SÉCURITÉ CRITIQUE: Ce service ne doit JAMAIS être appelé en mode démo
 * Le mode démo utilise exclusivement demo-local-storage
 */

import { supabase } from '@/integrations/supabase/client';
import { isDemoSession } from '@/utils/demo-detection';
import { Cabinet } from '@/types';

/**
 * Vérification de sécurité commune pour tous les appels
 */
async function ensureNotDemoMode(functionName: string): Promise<void> {
  const isDemoMode = await isDemoSession();
  if (isDemoMode) {
    throw new Error(
      `🚨 VIOLATION SÉCURITÉ: ${functionName} appelé en mode démo. ` +
      `Utilisez demo-local-storage pour les cabinets en mode démo.`
    );
  }
}

export async function getCabinets(): Promise<Cabinet[]> {
  await ensureNotDemoMode('getCabinets');
  
  const { data, error } = await supabase
    .from('Cabinet')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Erreur lors de la récupération des cabinets:', error);
    throw error;
  }
  
  // Transformer vers le type Cabinet - adapter selon les colonnes disponibles
  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name || '',
    address: item.address || '',
    city: '', // Non disponible en base 
    postalCode: '', // Non disponible en base
    phone: item.phone || '',
    email: item.email || '',
    siret: '', // Non disponible en base
    iban: null, // Non disponible en base
    bic: null, // Non disponible en base
    country: 'FR', // Valeur par défaut
    osteopathId: item.osteopathId || 0,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString()
  } as Cabinet));
}

export async function getCabinetById(id: number): Promise<Cabinet | null> {
  await ensureNotDemoMode('getCabinetById');
  
  const { data, error } = await supabase
    .from('Cabinet')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Cabinet non trouvé
    }
    console.error('Erreur lors de la récupération du cabinet:', error);
    throw error;
  }
  
  return data ? {
    id: data.id,
    name: data.name || '',
    address: data.address || '',
    city: '', // Non disponible en base
    postalCode: '', // Non disponible en base
    phone: data.phone || '',
    email: data.email || '',
    siret: '', // Non disponible en base
    iban: null, // Non disponible en base
    bic: null, // Non disponible en base
    country: 'FR', // Valeur par défaut
    osteopathId: data.osteopathId || 0,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  } as Cabinet : null;
}

export async function createCabinet(cabinet: Partial<Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>> & { name: string; address: string; osteopathId: number }): Promise<Cabinet> {
  await ensureNotDemoMode('createCabinet');
  
  // Filtrer seulement les champs qui existent dans Supabase
  const cabinetData = {
    name: cabinet.name,
    address: cabinet.address,
    phone: cabinet.phone || null,
    email: cabinet.email || null,
    osteopathId: cabinet.osteopathId
  };
  
  const { data, error } = await supabase
    .from('Cabinet')
    .insert([cabinetData])
    .select('*')
    .single();
    
  if (error) {
    console.error('Erreur lors de la création du cabinet:', error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name || '',
    address: data.address || '',
    city: '', // Non disponible en base
    postalCode: '', // Non disponible en base
    phone: data.phone || '',
    email: data.email || '',
    siret: '', // Non disponible en base
    iban: null, // Non disponible en base
    bic: null, // Non disponible en base
    country: 'FR', // Valeur par défaut
    osteopathId: data.osteopathId || 0,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  } as Cabinet;
}

export async function updateCabinet(id: number, updates: Partial<Cabinet>): Promise<Cabinet> {
  await ensureNotDemoMode('updateCabinet');
  
  const { data, error } = await supabase
    .from('Cabinet')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) {
    console.error('Erreur lors de la mise à jour du cabinet:', error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name || '',
    address: data.address || '',
    city: '', // Non disponible en base
    postalCode: '', // Non disponible en base
    phone: data.phone || '',
    email: data.email || '',
    siret: '', // Non disponible en base
    iban: null, // Non disponible en base
    bic: null, // Non disponible en base
    country: 'FR', // Valeur par défaut
    osteopathId: data.osteopathId || 0,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  } as Cabinet;
}

export async function deleteCabinet(id: number): Promise<boolean> {
  await ensureNotDemoMode('deleteCabinet');
  
  const { error } = await supabase
    .from('Cabinet')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erreur lors de la suppression du cabinet:', error);
    throw error;
  }
  
  return true;
}

// Service export pour compatibilité
export const supabaseCabinetService = {
  getCabinets,
  getCabinetById,
  createCabinet,
  updateCabinet,
  deleteCabinet
};
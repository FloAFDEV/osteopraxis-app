
import { useState, useEffect } from 'react';
import { Patient } from '@/types';
import { api } from '@/services/api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class PatientCache {
  private cache = new Map<string, CacheEntry<Patient[]>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: Patient[], ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  get(key: string): Patient[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

const patientCache = new PatientCache();

export function usePatientCache() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = async (forceRefresh = false) => {
    const cacheKey = 'all-patients';
    
    if (!forceRefresh) {
      const cachedData = patientCache.get(cacheKey);
      if (cachedData) {
        setPatients(cachedData);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      const patientsData = await api.getPatients();
      patientCache.set(cacheKey, patientsData);
      setPatients(patientsData);
      return patientsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des patients';
      setError(errorMessage);
      console.error('Error loading patients:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = () => {
    patientCache.invalidate();
  };

  const updatePatientInCache = (updatedPatient: Patient) => {
    const cacheKey = 'all-patients';
    const cachedData = patientCache.get(cacheKey);
    
    if (cachedData) {
      const updatedPatients = cachedData.map(p => 
        p.id === updatedPatient.id ? updatedPatient : p
      );
      patientCache.set(cacheKey, updatedPatients);
      setPatients(updatedPatients);
    }
  };

  const addPatientToCache = (newPatient: Patient) => {
    const cacheKey = 'all-patients';
    const cachedData = patientCache.get(cacheKey);
    
    if (cachedData) {
      const updatedPatients = [...cachedData, newPatient];
      patientCache.set(cacheKey, updatedPatients);
      setPatients(updatedPatients);
    }
  };

  const removePatientFromCache = (patientId: number) => {
    const cacheKey = 'all-patients';
    const cachedData = patientCache.get(cacheKey);
    
    if (cachedData) {
      const updatedPatients = cachedData.filter(p => p.id !== patientId);
      patientCache.set(cacheKey, updatedPatients);
      setPatients(updatedPatients);
    }
  };

  // Cleanup expired entries on mount
  useEffect(() => {
    patientCache.cleanup();
    const interval = setInterval(() => {
      patientCache.cleanup();
    }, 60000); // Cleanup every minute

    return () => clearInterval(interval);
  }, []);

  return {
    patients,
    loading,
    error,
    loadPatients,
    invalidateCache,
    updatePatientInCache,
    addPatientToCache,
    removePatientFromCache
  };
}

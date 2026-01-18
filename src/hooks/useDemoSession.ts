import { useState, useEffect, useCallback } from 'react';

const DEMO_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY = 'osteopraxis_demo_session';

export type PaywallReason =
  | 'timer_expired'
  | 'patient_limit'
  | 'appointment_limit'
  | 'invoice_limit'
  | 'export_blocked'
  | 'save_blocked';

export interface DemoLimits {
  patients: { current: number; max: number };
  appointments: { current: number; max: number };
  invoices: { current: number; max: number };
}

export interface DemoActions {
  canCreatePatient: boolean;
  canCreateAppointment: boolean;
  canCreateInvoice: boolean;
  canExport: boolean;
  canSaveToCloud: boolean;
}

export interface DemoSession {
  isActive: boolean;
  startedAt: number;
  expiresAt: number;
  remainingMs: number;
  remainingFormatted: string;
  limits: DemoLimits;
  actions: DemoActions;
}

interface DemoSessionStorage {
  started_at: number;
  expires_at: number;
  usage: {
    patients: number;
    appointments: number;
    invoices: number;
  };
  paywall_shown: boolean;
  paywall_reason: PaywallReason | null;
}

interface DemoSessionAPI {
  session: DemoSession | null;
  startDemo: () => void;
  endDemo: () => void;
  checkLimit: (resource: 'patient' | 'appointment' | 'invoice') => boolean;
  incrementUsage: (resource: 'patient' | 'appointment' | 'invoice') => void;
  showPaywall: (reason: PaywallReason) => void;
  paywallReason: PaywallReason | null;
}

const LIMITS = {
  patients: 3,
  appointments: 2,
  invoices: 1,
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getStoredSession(): DemoSessionStorage | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveSession(session: DemoSessionStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function useDemoSession(): DemoSessionAPI {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null);

  const updateSession = useCallback(() => {
    const stored = getStoredSession();

    if (!stored) {
      setSession(null);
      return;
    }

    const now = Date.now();
    const remainingMs = stored.expires_at - now;

    if (remainingMs <= 0) {
      clearSession();
      setSession(null);
      setPaywallReason('timer_expired');
      return;
    }

    const limits: DemoLimits = {
      patients: { current: stored.usage.patients, max: LIMITS.patients },
      appointments: { current: stored.usage.appointments, max: LIMITS.appointments },
      invoices: { current: stored.usage.invoices, max: LIMITS.invoices },
    };

    const actions: DemoActions = {
      canCreatePatient: stored.usage.patients < LIMITS.patients,
      canCreateAppointment: stored.usage.appointments < LIMITS.appointments,
      canCreateInvoice: stored.usage.invoices < LIMITS.invoices,
      canExport: false,
      canSaveToCloud: false,
    };

    setSession({
      isActive: true,
      startedAt: stored.started_at,
      expiresAt: stored.expires_at,
      remainingMs,
      remainingFormatted: formatTime(remainingMs),
      limits,
      actions,
    });
  }, []);

  useEffect(() => {
    updateSession();

    // Mettre à jour toutes les secondes
    const interval = setInterval(updateSession, 1000);

    return () => clearInterval(interval);
  }, [updateSession]);

  const startDemo = useCallback(() => {
    const now = Date.now();
    const newSession: DemoSessionStorage = {
      started_at: now,
      expires_at: now + DEMO_SESSION_DURATION,
      usage: {
        patients: 0,
        appointments: 0,
        invoices: 0,
      },
      paywall_shown: false,
      paywall_reason: null,
    };

    saveSession(newSession);
    updateSession();
    console.log('🎭 Session démo démarrée (30 minutes)');
  }, [updateSession]);

  const endDemo = useCallback(() => {
    clearSession();
    setSession(null);
    console.log('🎭 Session démo terminée');
  }, []);

  const checkLimit = useCallback((resource: 'patient' | 'appointment' | 'invoice'): boolean => {
    const stored = getStoredSession();
    if (!stored) return false;

    const resourceKey = `${resource}s` as keyof typeof stored.usage;
    const limit = LIMITS[resourceKey];

    return stored.usage[resourceKey] < limit;
  }, []);

  const incrementUsage = useCallback((resource: 'patient' | 'appointment' | 'invoice') => {
    const stored = getStoredSession();
    if (!stored) return;

    const resourceKey = `${resource}s` as keyof typeof stored.usage;
    stored.usage[resourceKey] += 1;

    saveSession(stored);
    updateSession();

    console.log(`🎭 Usage démo incrémenté: ${resource} (${stored.usage[resourceKey]}/${LIMITS[resourceKey]})`);
  }, [updateSession]);

  const showPaywall = useCallback((reason: PaywallReason) => {
    setPaywallReason(reason);

    const stored = getStoredSession();
    if (stored) {
      stored.paywall_shown = true;
      stored.paywall_reason = reason;
      saveSession(stored);
    }

    console.log(`💎 Paywall affiché: ${reason}`);
  }, []);

  return {
    session,
    startDemo,
    endDemo,
    checkLimit,
    incrementUsage,
    showPaywall,
    paywallReason,
  };
}

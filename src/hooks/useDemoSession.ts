import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { seedDemoData } from '@/services/demo-seed-data';

const DEMO_DURATION_MS = 60 * 60 * 1000; // 60 minutes
const DEMO_MAX_ATTEMPTS = 5;
const DEMO_RESET_PERIOD_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
const STORAGE_KEY = 'demo_session';
const ATTEMPTS_KEY = 'demo_attempts_count';
const LAST_RESET_KEY = 'demo_attempts_last_reset';
const USER_ID_KEY = 'demo_user_id';
const CABINET_ID_KEY = 'demo_cabinet_id';
const CABINET_NAME_KEY = 'demo_cabinet_name';

interface DemoSessionData {
  startTime: number;
  endTime: number;
  userId: string;
  cabinetId: string;
  cabinetName: string;
}

export function useDemoSession() {
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [demoUserId, setDemoUserId] = useState<string | null>(null);
  const [demoCabinetId, setDemoCabinetId] = useState<string | null>(null);
  const [demoCabinetName, setDemoCabinetName] = useState<string | null>(null);

  // Mode développeur automatique (localhost ou dev environment)
  const isDevMode = useCallback((): boolean => {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.port === '5173'; // Vite dev server
  }, []);

  const checkAndResetAttempts = useCallback(() => {
    const lastReset = localStorage.getItem(LAST_RESET_KEY);
    const now = Date.now();

    if (!lastReset) {
      localStorage.setItem(LAST_RESET_KEY, now.toString());
      localStorage.setItem(ATTEMPTS_KEY, '0');
      return;
    }

    const lastResetTime = parseInt(lastReset, 10);
    if (now - lastResetTime > DEMO_RESET_PERIOD_MS) {
      localStorage.setItem(LAST_RESET_KEY, now.toString());
      localStorage.setItem(ATTEMPTS_KEY, '0');
    }
  }, []);

  const canStartDemo = useCallback((): boolean => {
    // Mode développeur : accès illimité
    if (isDevMode()) {
      return true;
    }

    // Mode normal : 5 essais maximum sur 30 jours
    checkAndResetAttempts();
    const attemptsStr = localStorage.getItem(ATTEMPTS_KEY);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    return attempts < DEMO_MAX_ATTEMPTS;
  }, [isDevMode, checkAndResetAttempts]);

  const getRemainingAttempts = useCallback((): number => {
    // Mode développeur : toujours illimité
    if (isDevMode()) {
      return 999;
    }

    // Mode normal : retourner le nombre d'essais restants
    checkAndResetAttempts();
    const attemptsStr = localStorage.getItem(ATTEMPTS_KEY);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    return DEMO_MAX_ATTEMPTS - attempts;
  }, [isDevMode, checkAndResetAttempts]);

  const loadSession = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      const data: DemoSessionData = JSON.parse(stored);
      const now = Date.now();

      if (now < data.endTime) {
        return data;
      } else {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, []);

  const startDemo = useCallback(() => {
    if (!canStartDemo()) {
      return false;
    }

    const now = Date.now();
    const userId = uuidv4();
    const cabinetId = uuidv4();
    const cabinetName = `Cabinet Démo ${Math.floor(Math.random() * 1000)}`;

    const data: DemoSessionData = {
      startTime: now,
      endTime: now + DEMO_DURATION_MS,
      userId,
      cabinetId,
      cabinetName
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(USER_ID_KEY, userId);
    localStorage.setItem(CABINET_ID_KEY, cabinetId);
    localStorage.setItem(CABINET_NAME_KEY, cabinetName);

    // Incrémenter le compteur d'essais uniquement en mode normal (pas en mode dev)
    if (!isDevMode()) {
      const attemptsStr = localStorage.getItem(ATTEMPTS_KEY);
      const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
      localStorage.setItem(ATTEMPTS_KEY, (attempts + 1).toString());
    }

    seedDemoData(cabinetId, userId, cabinetName);

    setIsDemoActive(true);
    setRemainingMs(DEMO_DURATION_MS);
    setDemoUserId(userId);
    setDemoCabinetId(cabinetId);
    setDemoCabinetName(cabinetName);

    return true;
  }, [canStartDemo]);

  const endDemo = useCallback(() => {
    // Nettoyer toutes les données démo
    const cabinetId = localStorage.getItem(CABINET_ID_KEY);
    if (cabinetId) {
      const { DemoStorage } = require('@/services/demo-storage');
      DemoStorage.clearCabinet(cabinetId);
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(CABINET_ID_KEY);
    localStorage.removeItem(CABINET_NAME_KEY);

    setIsDemoActive(false);
    setRemainingMs(0);
    setDemoUserId(null);
    setDemoCabinetId(null);
    setDemoCabinetName(null);
  }, []);

  useEffect(() => {
    const session = loadSession();

    if (session) {
      const now = Date.now();
      const remaining = session.endTime - now;
      setIsDemoActive(true);
      setRemainingMs(remaining);
      setDemoUserId(session.userId);
      setDemoCabinetId(session.cabinetId);
      setDemoCabinetName(session.cabinetName);
    }
  }, [loadSession]);

  useEffect(() => {
    if (!isDemoActive) return;

    const interval = setInterval(() => {
      const session = loadSession();

      if (!session) {
        setIsDemoActive(false);
        setRemainingMs(0);
        setDemoUserId(null);
        setDemoCabinetId(null);
        setDemoCabinetName(null);
        return;
      }

      const now = Date.now();
      const remaining = session.endTime - now;

      if (remaining <= 0) {
        endDemo();
      } else {
        setRemainingMs(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isDemoActive, loadSession, endDemo]);

  return {
    startDemo,
    endDemo,
    canStartDemo,
    getRemainingAttempts,
    isDemoActive,
    remainingMs,
    demoUserId,
    demoCabinetId,
    demoCabinetName
  };
}


import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const DEFAULT_WARNING_BEFORE_TIMEOUT = 60 * 1000; // 1 minute warning
const DEFAULT_THROTTLE_MS = 1000; // throttle mousemove

type AutoLogoutOptions = {
  timeoutMs?: number;
  warningBeforeMs?: number;
  enableCrossTab?: boolean; // sync activity between tabs (default: true)
  throttleMs?: number;
};

export const useAutoLogout = (options?: AutoLogoutOptions) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const bcRef = useRef<BroadcastChannel | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);

  const timeoutMs = options?.timeoutMs ?? DEFAULT_INACTIVITY_TIMEOUT;
  const warningBeforeMs = options?.warningBeforeMs ?? DEFAULT_WARNING_BEFORE_TIMEOUT;
  const enableCrossTab = options?.enableCrossTab ?? true;
  const throttleMs = options?.throttleMs ?? DEFAULT_THROTTLE_MS;

  const broadcastActivity = () => {
    if (!enableCrossTab) return;
    try {
      if (bcRef.current) {
        bcRef.current.postMessage({ type: 'active', at: Date.now() });
      } else {
        localStorage.setItem('app:activity', String(Date.now()));
      }
    } catch (e) {
      // no-op
    }
  };

  const broadcastForceLogout = () => {
    if (!enableCrossTab) return;
    try {
      if (bcRef.current) {
        bcRef.current.postMessage({ type: 'force-logout', at: Date.now() });
      } else {
        localStorage.setItem('app:logout', String(Date.now()));
      }
    } catch (e) {
      // no-op
    }
  };

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Warning toast
    warningTimeoutRef.current = setTimeout(() => {
      toast.warning("Vous serez déconnecté dans 1 minute pour inactivité", { duration: 10000 });
    }, Math.max(0, timeoutMs - warningBeforeMs));

    // Logout timeout
    timeoutRef.current = setTimeout(async () => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;
      try {
        await supabase.auth.signOut();
      } finally {
        toast.info("Vous avez été déconnecté pour inactivité");
        broadcastForceLogout();
        navigate('/login', { replace: true });
      }
    }, timeoutMs);
  };

  useEffect(() => {
    let storageHandler: ((e: StorageEvent) => void) | null = null;

    // Setup BroadcastChannel or storage fallback
    if (enableCrossTab) {
      if ('BroadcastChannel' in window) {
        bcRef.current = new BroadcastChannel('app-activity');
        bcRef.current.onmessage = (event: MessageEvent) => {
          const data = (event as any).data;
          if (!data) return;
          if (data.type === 'active') {
            resetTimer();
          }
          if (data.type === 'force-logout' && !isLoggingOutRef.current) {
            isLoggingOutRef.current = true;
            supabase.auth.signOut().finally(() => {
              navigate('/login', { replace: true });
            });
          }
        };
      } else {
        storageHandler = (e: StorageEvent) => {
          if (e.key === 'app:activity') {
            resetTimer();
          }
          if (e.key === 'app:logout' && !isLoggingOutRef.current) {
            isLoggingOutRef.current = true;
            supabase.auth.signOut().finally(() => {
              navigate('/login', { replace: true });
            });
          }
        };
        (window as any).addEventListener('storage', storageHandler as any);
      }
    }

    // Events that reset the timer
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'] as const;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current < throttleMs) return;
      lastActivityRef.current = now;
      resetTimer();
      broadcastActivity();
    };

    // Add event listeners
    events.forEach((evt) => {
      document.addEventListener(evt, handleActivity as EventListener, false);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (bcRef.current) {
        bcRef.current.close();
        bcRef.current = null;
      }
      if (storageHandler) {
        (window as any).removeEventListener('storage', storageHandler as any);
      }
    };
  }, [navigate, enableCrossTab, throttleMs, timeoutMs, warningBeforeMs]);
};

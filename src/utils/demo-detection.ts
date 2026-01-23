let demoSessionCache: { result: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 10000;

export const isDemoSession = async (): Promise<boolean> => {
  const now = Date.now();
  if (demoSessionCache && (now - demoSessionCache.timestamp) < CACHE_DURATION) {
    return demoSessionCache.result;
  }

  try {
    const demoSessionStr = localStorage.getItem('demo_session');

    if (!demoSessionStr) {
      const result = false;
      demoSessionCache = { result, timestamp: now };
      return result;
    }

    const session = JSON.parse(demoSessionStr);
    const isActive = session.endTime && now < session.endTime;

    const result = !!isActive;
    demoSessionCache = { result, timestamp: now };
    return result;
  } catch (error) {
    console.error('Erreur détection session démo:', error);
    const result = false;
    demoSessionCache = { result, timestamp: now };
    return result;
  }
};

export const clearDemoSessionCache = (): void => {
  demoSessionCache = null;
};

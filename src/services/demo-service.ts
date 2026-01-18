export interface DemoData {
  patients: any[];
  appointments: any[];
  invoices: any[];
  stats: any;
}

// Service pour gérer les sessions démo locales (FRONT-ONLY)
export class DemoService {
  private static readonly DEMO_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  // Vérifier si la session démo actuelle est expirée
  static async isSessionExpired(): Promise<boolean> {
    try {
      const { demoLocalStorage } = await import('./demo-local-storage');
      return !demoLocalStorage.isSessionActive();
    } catch {
      return true;
    }
  }

  // Obtenir les infos de la session démo actuelle
  static async getCurrentDemoSession(): Promise<{ sessionId: string; expiresAt: string; remainingTime: number } | null> {
    try {
      const { demoLocalStorage } = await import('./demo-local-storage');
      const session = demoLocalStorage.getCurrentSession();

      if (!session) return null;

      const remainingTime = new Date(session.expiresAt).getTime() - Date.now();

      if (remainingTime <= 0) {
        demoLocalStorage.clearSession();
        return null;
      }

      return {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt.toISOString(),
        remainingTime
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la session démo:', error);
      return null;
    }
  }
}

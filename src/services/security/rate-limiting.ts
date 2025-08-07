/**
 * Protection contre le brute force et limitation de taux
 * Protège les endpoints sensibles contre les attaques automatisées
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

export interface RateLimitAttempt {
  timestamp: number;
  ip: string;
  endpoint: string;
  success: boolean;
}

/**
 * Service de limitation de taux côté frontend
 */
export class RateLimitingService {
  private attempts: Map<string, RateLimitAttempt[]> = new Map();
  private blockedIPs: Map<string, number> = new Map();

  private defaultConfig: RateLimitConfig = {
    maxRequests: 5, // 5 tentatives max
    windowMs: 15 * 60 * 1000, // dans une fenêtre de 15 minutes
    blockDurationMs: 30 * 60 * 1000 // blocage 30 minutes
  };

  /**
   * Vérifie si une requête est autorisée
   */
  checkRateLimit(
    endpoint: string, 
    ip: string = this.getClientIP(),
    config: Partial<RateLimitConfig> = {}
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = `${ip}:${endpoint}`;
    const now = Date.now();

    // Vérifier si l'IP est bloquée
    const blockUntil = this.blockedIPs.get(ip);
    if (blockUntil && now < blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockUntil
      };
    }

    // Nettoyer les anciennes tentatives
    this.cleanOldAttempts(key, now, finalConfig.windowMs);

    // Récupérer les tentatives récentes
    const recentAttempts = this.attempts.get(key) || [];
    const remaining = Math.max(0, finalConfig.maxRequests - recentAttempts.length);

    if (recentAttempts.length >= finalConfig.maxRequests) {
      // Bloquer l'IP
      this.blockedIPs.set(ip, now + finalConfig.blockDurationMs);
      
      // Logger l'attaque potentielle
      console.warn(`🚨 TENTATIVE BRUTE FORCE DÉTECTÉE: ${ip} sur ${endpoint}`);
      this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip, endpoint, attempts: recentAttempts.length });

      return {
        allowed: false,
        remaining: 0,
        resetTime: now + finalConfig.blockDurationMs
      };
    }

    return {
      allowed: true,
      remaining,
      resetTime: now + finalConfig.windowMs
    };
  }

  /**
   * Enregistre une tentative
   */
  recordAttempt(
    endpoint: string,
    success: boolean,
    ip: string = this.getClientIP()
  ): void {
    const key = `${ip}:${endpoint}`;
    const attempt: RateLimitAttempt = {
      timestamp: Date.now(),
      ip,
      endpoint,
      success
    };

    const attempts = this.attempts.get(key) || [];
    attempts.push(attempt);
    this.attempts.set(key, attempts);

    // Si plusieurs échecs consécutifs, alerter
    const recentFailures = attempts
      .filter(a => !a.success)
      .filter(a => Date.now() - a.timestamp < 5 * 60 * 1000); // 5 dernières minutes

    if (recentFailures.length >= 3) {
      console.warn(`🚨 ÉCHECS MULTIPLES DÉTECTÉS: ${ip} sur ${endpoint}`);
      this.logSecurityEvent('MULTIPLE_FAILURES', { ip, endpoint, failures: recentFailures.length });
    }
  }

  /**
   * Obtient l'IP du client (simulation côté frontend)
   */
  private getClientIP(): string {
    // En production, ceci serait géré côté serveur
    // Ici, on utilise un identifiant basé sur le navigateur
    if (!localStorage.getItem('client_fingerprint')) {
      const fingerprint = this.generateFingerprint();
      localStorage.setItem('client_fingerprint', fingerprint);
    }
    return localStorage.getItem('client_fingerprint') || 'unknown';
  }

  /**
   * Génère une empreinte unique du navigateur
   */
  private generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Fingerprint test', 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    // Hash simple
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return 'fp_' + Math.abs(hash).toString(36);
  }

  /**
   * Nettoie les anciennes tentatives
   */
  private cleanOldAttempts(key: string, now: number, windowMs: number): void {
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(attempt => 
      now - attempt.timestamp < windowMs
    );
    
    if (validAttempts.length !== attempts.length) {
      this.attempts.set(key, validAttempts);
    }
  }

  /**
   * Log des événements de sécurité
   */
  private logSecurityEvent(type: string, data: any): void {
    const event = {
      type,
      timestamp: new Date().toISOString(),
      data,
      userAgent: navigator.userAgent
    };

    // Envoyer au service de monitoring (en production)
    console.warn('Security Event:', event);
    
    // Stocker localement pour analyse
    const events = JSON.parse(localStorage.getItem('security_events') || '[]');
    events.push(event);
    
    // Garder seulement les 100 derniers événements
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('security_events', JSON.stringify(events));
  }

  /**
   * Vérifie les patterns suspects
   */
  detectSuspiciousActivity(ip: string): boolean {
    const allAttempts = Array.from(this.attempts.values()).flat()
      .filter(attempt => attempt.ip === ip);

    // Beaucoup de tentatives sur différents endpoints
    const uniqueEndpoints = new Set(allAttempts.map(a => a.endpoint));
    if (uniqueEndpoints.size > 10 && allAttempts.length > 50) {
      return true;
    }

    // Tentatives très rapides (bot)
    const recentAttempts = allAttempts
      .filter(a => Date.now() - a.timestamp < 60000) // Dernière minute
      .sort((a, b) => a.timestamp - b.timestamp);

    if (recentAttempts.length > 20) {
      return true;
    }

    // Pattern temporel suspect
    const intervals = [];
    for (let i = 1; i < recentAttempts.length; i++) {
      intervals.push(recentAttempts[i].timestamp - recentAttempts[i-1].timestamp);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (avgInterval < 100 && intervals.length > 5) { // Moins de 100ms entre tentatives
      return true;
    }

    return false;
  }

  /**
   * Obtient les statistiques de sécurité
   */
  getSecurityStats(): {
    totalAttempts: number;
    blockedIPs: number;
    suspiciousActivity: number;
    recentEvents: any[];
  } {
    const totalAttempts = Array.from(this.attempts.values())
      .reduce((total, attempts) => total + attempts.length, 0);

    const activeBlocks = Array.from(this.blockedIPs.values())
      .filter(blockTime => Date.now() < blockTime).length;

    const uniqueIPs = new Set(Array.from(this.attempts.keys()).map(key => key.split(':')[0]));
    const suspiciousCount = Array.from(uniqueIPs)
      .filter(ip => this.detectSuspiciousActivity(ip)).length;

    const recentEvents = JSON.parse(localStorage.getItem('security_events') || '[]')
      .slice(-10);

    return {
      totalAttempts,
      blockedIPs: activeBlocks,
      suspiciousActivity: suspiciousCount,
      recentEvents
    };
  }

  /**
   * Réinitialise les limitations pour une IP (admin seulement)
   */
  resetRateLimit(ip: string): void {
    this.blockedIPs.delete(ip);
    
    // Supprimer toutes les tentatives de cette IP
    const keysToDelete = Array.from(this.attempts.keys())
      .filter(key => key.startsWith(ip + ':'));
    
    keysToDelete.forEach(key => this.attempts.delete(key));
    
    console.log(`Rate limit reset for IP: ${ip}`);
  }
}

/**
 * Middleware pour protéger les actions sensibles
 */
export function withRateLimit<T extends any[]>(
  endpoint: string,
  fn: (...args: T) => Promise<any>,
  config?: Partial<RateLimitConfig>
) {
  return async (...args: T) => {
    const rateLimit = rateLimitingService;
    const check = rateLimit.checkRateLimit(endpoint, undefined, config);

    if (!check.allowed) {
      const resetDate = new Date(check.resetTime);
      throw new Error(`Trop de tentatives. Réessayez après ${resetDate.toLocaleTimeString()}`);
    }

    try {
      const result = await fn(...args);
      rateLimit.recordAttempt(endpoint, true);
      return result;
    } catch (error) {
      rateLimit.recordAttempt(endpoint, false);
      throw error;
    }
  };
}

/**
 * Instance singleton du service
 */
export const rateLimitingService = new RateLimitingService();

export default RateLimitingService;
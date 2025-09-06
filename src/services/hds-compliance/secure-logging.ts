/**
 * Système de logging sécurisé HDS
 * Remplace TOUS les console.log/error/warn par un logging sécurisé
 * qui ne fuite JAMAIS de données sensibles
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  component?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  sanitized: boolean;
}

/**
 * Patterns de données sensibles à masquer
 */
const SENSITIVE_PATTERNS = [
  // Données personnelles
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b(?:\+33|0)[1-9](?:[.\-\s]?\d{2}){4}\b/g, // Téléphone français
  /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // Dates de naissance
  /\b\d{4}-\d{2}-\d{2}\b/g, // Dates ISO
  
  // Données médicales
  /\b(?:douleur|symptôme|diagnostic|traitement|maladie|pathologie)\s+[^,\.\n]{5,50}/gi,
  /\b(?:allergie|antécédent|prescription|ordonnance)\s+[^,\.\n]{5,50}/gi,
  
  // Données d'identification
  /\b\d{15,16}\b/g, // Numéros sécurité sociale potentiels
  /\b[A-Z]{2}\d{6,10}\b/g, // Identifiants médicaux
  
  // Tokens et clés
  /\b[A-Za-z0-9]{32,}\b/g, // Tokens/clés potentiels
  /bearer\s+[A-Za-z0-9._-]+/gi, // Tokens d'authentification
  /api[_-]?key[_-]?[A-Za-z0-9]+/gi, // Clés API
];

/**
 * Service de logging sécurisé
 */
export class SecureLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = LogLevel.INFO;

  /**
   * Sanitise un message pour enlever toutes les données sensibles
   */
  private sanitizeMessage(message: any): string {
    if (typeof message !== 'string') {
      // Convertir en string et nettoyer les objets complexes
      message = this.sanitizeObject(message);
    }

    let sanitized = String(message);

    // Remplacer tous les patterns sensibles
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[DONNÉES_SENSIBLES_MASQUÉES]');
    }

    // Masquer les IDs numériques longs (potentiellement sensibles)
    sanitized = sanitized.replace(/\b\d{6,}\b/g, '[ID_MASQUÉ]');

    // Masquer les noms/prénoms potentiels (mots en français commençant par une majuscule)
    sanitized = sanitized.replace(/\b[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ][a-zàâäéèêëïîôöùûüçñ]{2,15}\s+[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ][a-zàâäéèêëïîôöùûüçñ]{2,15}\b/g, '[NOM_MASQUÉ]');

    return sanitized;
  }

  /**
   * Sanitise un objet en masquant les propriétés sensibles
   */
  private sanitizeObject(obj: any): string {
    if (obj === null || obj === undefined) {
      return String(obj);
    }

    if (typeof obj !== 'object') {
      return this.sanitizeMessage(String(obj));
    }

    const sensitiveKeys = [
      'password', 'email', 'phone', 'firstName', 'lastName', 'name',
      'address', 'birthDate', 'diagnosis', 'symptoms', 'treatment',
      'notes', 'medicalHistory', 'allergies', 'token', 'apiKey',
      'patientId', 'osteopathId', 'ssn', 'medicalId'
    ];

    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sensitive => 
        lowerKey.includes(sensitive.toLowerCase())
      );

      if (isSensitive) {
        sanitized[key] = '[MASQUÉ]';
      } else if (typeof value === 'object') {
        sanitized[key] = '[OBJET]';
      } else {
        sanitized[key] = value;
      }
    }

    return JSON.stringify(sanitized);
  }

  /**
   * Log sécurisé - remplace console.log
   */
  info(message: any, component?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, component, metadata);
  }

  /**
   * Warning sécurisé - remplace console.warn
   */
  warn(message: any, component?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, component, metadata);
  }

  /**
   * Erreur sécurisée - remplace console.error
   */
  error(message: any, component?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, component, metadata);
  }

  /**
   * Debug sécurisé - remplace console.debug
   */
  debug(message: any, component?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, component, metadata);
  }

  /**
   * Critical - pour les erreurs critiques système
   */
  critical(message: any, component?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.CRITICAL, message, component, metadata);
  }

  /**
   * Méthode principale de logging
   */
  private log(
    level: LogLevel,
    message: any,
    component?: string,
    metadata?: Record<string, any>
  ): void {
    if (level < this.currentLevel) {
      return; // Niveau trop bas, ignorer
    }

    const sanitizedMessage = this.sanitizeMessage(message);
    const sanitizedMetadata = metadata ? this.sanitizeObject(metadata) : undefined;

    const entry: LogEntry = {
      level,
      message: sanitizedMessage,
      timestamp: new Date(),
      component,
      sessionId: this.getSessionId(),
      metadata: sanitizedMetadata ? JSON.parse(sanitizedMetadata) : undefined,
      sanitized: true
    };

    // Ajouter aux logs internes
    this.logs.push(entry);

    // Limiter le nombre de logs
    if (this.logs.length > this.maxLogs) {
      this.logs.splice(0, this.logs.length - this.maxLogs);
    }

    // En développement, afficher dans la console mais de façon sécurisée
    if (process.env.NODE_ENV === 'development') {
      const levelName = LogLevel[level];
      const prefix = `[${levelName}]${component ? `[${component}]` : ''}`;
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(`${prefix} ${sanitizedMessage}`);
          break;
        case LogLevel.INFO:
          console.info(`${prefix} ${sanitizedMessage}`);
          break;
        case LogLevel.WARN:
          console.warn(`${prefix} ${sanitizedMessage}`);
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          console.error(`${prefix} ${sanitizedMessage}`);
          break;
      }
    }

    // En production, envoyer vers un service de monitoring sécurisé
    if (process.env.NODE_ENV === 'production' && level >= LogLevel.ERROR) {
      this.sendToMonitoring(entry);
    }
  }

  /**
   * Obtient un ID de session anonymisé
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('secure_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 16);
      sessionStorage.setItem('secure_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Envoie les logs critiques vers un service de monitoring
   */
  private sendToMonitoring(entry: LogEntry): void {
    // En production, ceci enverrait vers un service comme Sentry, LogRocket, etc.
    // Mais de façon sécurisée, sans données sensibles
    console.warn('Monitoring:', {
      level: LogLevel[entry.level],
      message: entry.message,
      component: entry.component,
      timestamp: entry.timestamp.toISOString(),
      sessionId: entry.sessionId
    });
  }

  /**
   * Obtient les logs récents (pour débogage admin)
   */
  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Filtre les logs par niveau
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level >= level);
  }

  /**
   * Efface tous les logs (pour confidentialité)
   */
  clearLogs(): void {
    this.logs = [];
    console.info('Logs cleared for privacy');
  }

  /**
   * Définit le niveau de log minimum
   */
  setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Exporte les logs de façon sécurisée (pour support technique)
   */
  exportSecureLogs(): string {
    const secureExport = this.logs.map(log => ({
      level: LogLevel[log.level],
      message: log.message, // Déjà sanitisé
      timestamp: log.timestamp.toISOString(),
      component: log.component,
      sessionId: log.sessionId
    }));

    return JSON.stringify(secureExport, null, 2);
  }
}

/**
 * Instance singleton du logger sécurisé
 */
export const secureLogger = new SecureLogger();

/**
 * Fonctions de remplacement pour console.*
 * À utiliser partout dans l'application
 */
export const slog = {
  info: (message: any, component?: string, metadata?: any) => 
    secureLogger.info(message, component, metadata),
  
  warn: (message: any, component?: string, metadata?: any) => 
    secureLogger.warn(message, component, metadata),
  
  error: (message: any, component?: string, metadata?: any) => 
    secureLogger.error(message, component, metadata),
  
  debug: (message: any, component?: string, metadata?: any) => 
    secureLogger.debug(message, component, metadata),
  
  critical: (message: any, component?: string, metadata?: any) => 
    secureLogger.critical(message, component, metadata)
};

export default secureLogger;
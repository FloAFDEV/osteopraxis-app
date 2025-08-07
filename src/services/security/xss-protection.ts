/**
 * Protection XSS complète pour l'application
 * Sanitise TOUS les inputs utilisateur et sécurise l'affichage
 */

import DOMPurify from 'dompurify';

/**
 * Configuration DOMPurify sécurisée pour les données médicales
 */
const PURIFY_CONFIG = {
  // Interdire tous les scripts
  FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
  // Autoriser seulement les balises de formatage basique
  ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'div', 'span'],
  ALLOWED_ATTR: ['class'],
  // Supprimer tous les protocoles non-HTTP
  FORBID_ATTR_PREFIX: ['javascript:', 'data:', 'vbscript:'],
  // Mode strict
  WHOLE_DOCUMENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  SANITIZE_DOM: true,
  KEEP_CONTENT: false
};

/**
 * Classe principale de protection XSS
 */
export class XSSProtection {
  
  /**
   * Sanitise une chaîne de caractères pour empêcher les attaques XSS
   */
  static sanitizeString(input: string | null | undefined): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Utiliser DOMPurify pour nettoyer
    const cleaned = DOMPurify.sanitize(input, PURIFY_CONFIG);
    
    // Double vérification avec regex pour les cas critiques
    const doubleChecked = cleaned
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Scripts
      .replace(/javascript:/gi, '') // Protocol javascript
      .replace(/on\w+\s*=/gi, '') // Event handlers
      .replace(/data:/gi, '') // Data URLs
      .replace(/vbscript:/gi, ''); // VBScript
    
    return doubleChecked.trim();
  }

  /**
   * Sanitise un objet de données patient
   */
  static sanitizePatientData(patientData: any): any {
    if (!patientData || typeof patientData !== 'object') {
      return {};
    }

    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(patientData)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        );
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizePatientData(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Sanitise les données de formulaire avant soumission
   */
  static sanitizeFormData(formData: FormData): FormData {
    const sanitized = new FormData();
    
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        sanitized.append(key, this.sanitizeString(value));
      } else {
        sanitized.append(key, value);
      }
    }
    
    return sanitized;
  }

  /**
   * Valide et sanitise un email
   */
  static sanitizeEmail(email: string): string {
    const cleaned = this.sanitizeString(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(cleaned)) {
      throw new Error('Format email invalide');
    }
    
    return cleaned.toLowerCase();
  }

  /**
   * Valide et sanitise un numéro de téléphone
   */
  static sanitizePhone(phone: string): string {
    const cleaned = this.sanitizeString(phone);
    // Garder seulement chiffres, espaces, tirets, parenthèses, plus
    const phoneOnly = cleaned.replace(/[^0-9\s\-\(\)\+]/g, '');
    
    if (phoneOnly.length < 10) {
      throw new Error('Numéro de téléphone trop court');
    }
    
    return phoneOnly;
  }

  /**
   * Encode HTML pour affichage sécurisé
   */
  static encodeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Crée un élément HTML sécurisé pour l'affichage
   */
  static createSafeHTML(content: string): string {
    return DOMPurify.sanitize(content, {
      ...PURIFY_CONFIG,
      RETURN_DOM: false
    });
  }

  /**
   * Valide qu'une URL est sûre
   */
  static validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const allowedProtocols = ['http:', 'https:', 'mailto:'];
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Sanitise les paramètres d'URL
   */
  static sanitizeURLParams(params: URLSearchParams): URLSearchParams {
    const sanitized = new URLSearchParams();
    
    for (const [key, value] of params.entries()) {
      sanitized.append(
        this.sanitizeString(key),
        this.sanitizeString(value)
      );
    }
    
    return sanitized;
  }
}

/**
 * Hook React pour sanitiser automatiquement les données
 */
export function useSanitizedData<T>(data: T): T {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return XSSProtection.sanitizeString(data) as T;
  }
  
  if (typeof data === 'object') {
    return XSSProtection.sanitizePatientData(data) as T;
  }
  
  return data;
}

/**
 * Composant wrapper pour afficher du contenu sanitisé (optionnel)
 */

/**
 * Middleware pour valider les inputs de recherche
 */
export function validateSearchInput(query: string): string {
  const sanitized = XSSProtection.sanitizeString(query);
  
  // Limiter la longueur pour éviter DoS
  if (sanitized.length > 100) {
    throw new Error('Requête de recherche trop longue');
  }
  
  // Interdire certains patterns dangereux
  const dangerousPatterns = [
    /select\s+.*from/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+.*set/i,
    /<script/i,
    /javascript:/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('Caractères non autorisés dans la recherche');
    }
  }
  
  return sanitized;
}

export default XSSProtection;
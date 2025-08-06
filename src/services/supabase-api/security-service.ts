
import { supabase } from "@/integrations/supabase/client";

export class SecurityService {
  /**
   * Vérifie si l'utilisateur actuel est un administrateur
   */
  static async verifyAdminAccess(): Promise<boolean> {
    try {
      const { data: isAdmin, error } = await supabase.rpc('verify_admin_access');
      
      if (error) {
        console.error('Erreur lors de la vérification admin:', error);
        return false;
      }
      
      return isAdmin || false;
    } catch (error) {
      console.error('Exception lors de la vérification admin:', error);
      return false;
    }
  }

  /**
   * Valide un email selon les règles définies en base
   */
  static async validateEmail(email: string): Promise<boolean> {
    try {
      const { data: isValid, error } = await supabase.rpc('validate_email', {
        email: email
      });
      
      if (error) {
        console.error('Erreur lors de la validation email:', error);
        return false;
      }
      
      return isValid || false;
    } catch (error) {
      console.error('Exception lors de la validation email:', error);
      return false;
    }
  }

  /**
   * Valide un numéro de téléphone selon les règles définies en base
   */
  static async validatePhone(phone: string): Promise<boolean> {
    try {
      const { data: isValid, error } = await supabase.rpc('validate_phone', {
        phone: phone
      });
      
      if (error) {
        console.error('Erreur lors de la validation téléphone:', error);
        return false;
      }
      
      return isValid || false;
    } catch (error) {
      console.error('Exception lors de la validation téléphone:', error);
      return false;
    }
  }

  /**
   * Enregistre une action d'audit
   */
  static async logAction(
    action: string, 
    tableName: string, 
    recordId: string, 
    details?: any
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_audit_action', {
        p_action: action,
        p_table_name: tableName,
        p_record_id: recordId,
        p_new_values: details ? JSON.stringify(details) : null
      });
      
      if (error) {
        console.error('Erreur lors de l\'enregistrement d\'audit:', error);
      }
    } catch (error) {
      console.error('Exception lors de l\'enregistrement d\'audit:', error);
    }
  }

  /**
   * Nettoie les anciens logs de rate limiting
   */
  static async cleanupRateLimits(): Promise<void> {
    try {
      const { error } = await supabase.rpc('cleanup_rate_limits');
      
      if (error) {
        console.error('Erreur lors du nettoyage des rate limits:', error);
      }
    } catch (error) {
      console.error('Exception lors du nettoyage des rate limits:', error);
    }
  }
}

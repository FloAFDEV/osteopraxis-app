/**
 * 🔐 Gestionnaire de mot de passe en mémoire (RAM uniquement)
 * 
 * Stocke le mot de passe Supabase en mémoire pour le chiffrement local HDS.
 * ⚠️ Le mot de passe n'est JAMAIS persisté (ni localStorage, ni sessionStorage).
 * 
 * Cycle de vie:
 * - Stocké lors du login réussi
 * - Effacé lors du logout
 * - Effacé lors du refresh/fermeture navigateur (comportement normal RAM)
 */

class PasswordMemoryManager {
  private password: string | null = null;
  private isLocked: boolean = true;

  /**
   * Stocke le mot de passe en mémoire
   */
  store(password: string): void {
    this.password = password;
    this.isLocked = false;
    console.log('🔐 Mot de passe stocké en mémoire (RAM)');
  }

  /**
   * Récupère le mot de passe depuis la mémoire
   */
  get(): string | null {
    return this.password;
  }

  /**
   * Vérifie si un mot de passe est disponible
   */
  hasPassword(): boolean {
    return this.password !== null && this.password.length > 0;
  }

  /**
   * Vérifie si le storage est verrouillé
   */
  isStorageLocked(): boolean {
    return this.isLocked || !this.hasPassword();
  }

  /**
   * Efface le mot de passe de la mémoire
   */
  clear(): void {
    if (this.password) {
      // Nettoyer la chaîne en mémoire (overwrite)
      this.password = '';
      this.password = null;
      this.isLocked = true;
      console.log('🔓 Mot de passe effacé de la mémoire');
    }
  }

  /**
   * Déverrouille le storage (marque comme déverrouillé)
   */
  unlock(): void {
    if (this.hasPassword()) {
      this.isLocked = false;
      console.log('🔓 Storage déverrouillé');
    }
  }

  /**
   * Verrouille le storage (efface le mot de passe)
   */
  lock(): void {
    this.clear();
  }
}

export const passwordMemory = new PasswordMemoryManager();

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface SyncTask {
  id: string;
  type: 'appointment' | 'patient' | 'invoice';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

export class PWAService {
  private installPrompt: PWAInstallPrompt | null = null;
  private syncTasks: SyncTask[] = [];
  private isOnline = navigator.onLine;
  private syncInterval?: NodeJS.Timeout;

  constructor() {
    this.initializeListeners();
    this.startSyncService();
    this.loadOfflineData();
  }

  private initializeListeners(): void {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as any;
      this.showInstallBanner();
    });

    // Listen for app install
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.hideInstallBanner();
    });

    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for visibility change to sync when app becomes active
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncOfflineData();
      }
    });
  }

  // Installation
  async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) return false;

    try {
      await this.installPrompt.prompt();
      const result = await this.installPrompt.userChoice;
      this.installPrompt = null;
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  isInstallAvailable(): boolean {
    return this.installPrompt !== null;
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  private showInstallBanner(): void {
    // Créer une bannière d'installation personnalisée
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 z-50 bg-primary text-primary-foreground p-4 rounded-lg shadow-xl border border-primary/20';
    banner.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-sm">Installer l'application</p>
            <p class="text-xs opacity-90">Accès rapide depuis votre écran d'accueil</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button id="pwa-install-dismiss" class="text-xs px-3 py-1 bg-primary-foreground/20 rounded hover:bg-primary-foreground/30 transition-colors">
            Plus tard
          </button>
          <button id="pwa-install-accept" class="text-xs px-3 py-1 bg-primary-foreground text-primary rounded hover:bg-primary-foreground/90 transition-colors">
            Installer
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Event listeners pour les boutons
    document.getElementById('pwa-install-accept')?.addEventListener('click', () => {
      this.promptInstall();
      this.hideInstallBanner();
    });

    document.getElementById('pwa-install-dismiss')?.addEventListener('click', () => {
      this.hideInstallBanner();
      // Reporter l'affichage de 24h
      localStorage.setItem('pwa-install-dismissed', (Date.now() + 24 * 60 * 60 * 1000).toString());
    });

    // Vérifier si l'utilisateur a déjà reporté
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() < parseInt(dismissed)) {
      this.hideInstallBanner();
    }
  }

  private hideInstallBanner(): void {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  // Offline sync
  addSyncTask(task: Omit<SyncTask, 'id' | 'timestamp' | 'retryCount'>): void {
    const syncTask: SyncTask = {
      ...task,
      id: `${task.type}_${task.action}_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncTasks.push(syncTask);
    this.saveOfflineData();

    // Essayer de synchroniser immédiatement si en ligne
    if (this.isOnline) {
      this.processSyncTask(syncTask);
    }
  }

  private async processSyncTask(task: SyncTask): Promise<boolean> {
    try {
      let success = false;

      switch (task.type) {
        case 'appointment':
          success = await this.syncAppointment(task);
          break;
        case 'patient':
          success = await this.syncPatient(task);
          break;
        case 'invoice':
          success = await this.syncInvoice(task);
          break;
      }

      if (success) {
        this.removeSyncTask(task.id);
        return true;
      }
    } catch (error) {
      console.error('Sync task failed:', error);
    }

    // Incrementer le compteur de retry
    task.retryCount++;
    
    // Abandonner après 5 tentatives
    if (task.retryCount >= 5) {
      console.error('Sync task abandoned after 5 retries:', task);
      this.removeSyncTask(task.id);
      return false;
    }

    this.saveOfflineData();
    return false;
  }

  private async syncAppointment(task: SyncTask): Promise<boolean> {
    // Implémenter la logique de synchronisation des rendez-vous
    // Cette fonction devrait utiliser les services API appropriés
    return false; // Placeholder
  }

  private async syncPatient(task: SyncTask): Promise<boolean> {
    // Implémenter la logique de synchronisation des patients
    return false; // Placeholder
  }

  private async syncInvoice(task: SyncTask): Promise<boolean> {
    // Implémenter la logique de synchronisation des factures
    return false; // Placeholder
  }

  private removeSyncTask(taskId: string): void {
    this.syncTasks = this.syncTasks.filter(task => task.id !== taskId);
    this.saveOfflineData();
  }

  private async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.syncTasks.length === 0) return;

    console.log(`Syncing ${this.syncTasks.length} offline tasks...`);
    
    const tasksToSync = [...this.syncTasks];
    
    for (const task of tasksToSync) {
      await this.processSyncTask(task);
      // Attendre un peu entre chaque tâche pour ne pas surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private startSyncService(): void {
    // Synchroniser toutes les 30 secondes
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncOfflineData();
      }
    }, 30000);
  }

  private saveOfflineData(): void {
    try {
      localStorage.setItem('pwa-sync-tasks', JSON.stringify(this.syncTasks));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  private loadOfflineData(): void {
    try {
      const saved = localStorage.getItem('pwa-sync-tasks');
      if (saved) {
        this.syncTasks = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
      this.syncTasks = [];
    }
  }

  // Notifications
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }

  // Statistiques
  getStats(): {
    isOnline: boolean;
    isInstalled: boolean;
    pendingSyncTasks: number;
    notificationPermission: NotificationPermission;
  } {
    return {
      isOnline: this.isOnline,
      isInstalled: this.isInstalled(),
      pendingSyncTasks: this.syncTasks.length,
      notificationPermission: 'Notification' in window ? Notification.permission : 'denied'
    };
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.hideInstallBanner();
  }
}

export const pwaService = new PWAService();
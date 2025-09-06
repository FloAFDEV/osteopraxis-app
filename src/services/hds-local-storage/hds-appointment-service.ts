import { Appointment, AppointmentStatus } from "@/types";

class HDSAppointmentService {
  private dbName = 'HDS_PatientHub_DB';
  private version = 1;
  private db: IDBDatabase | null = null;

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('appointments')) {
          const store = db.createObjectStore('appointments', { keyPath: 'id', autoIncrement: true });
          store.createIndex('patientId', 'patientId', { unique: false });
          store.createIndex('osteopathId', 'osteopathId', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  async getAppointments(): Promise<Appointment[]> {
    console.log('🏥 HDS Appointment Service: Récupération RDV depuis stockage local');
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['appointments'], 'readonly');
      const store = transaction.objectStore('appointments');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          console.log(`✅ HDS Appointment Service: ${request.result.length} RDV récupérés`);
          resolve(request.result);
        };
        request.onerror = () => {
          console.error('❌ Erreur HDS getAppointments:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Erreur HDS getAppointments:', error);
      throw error;
    }
  }

  async getAppointmentById(id: number): Promise<Appointment | null> {
    console.log(`🏥 HDS Appointment Service: Recherche RDV ${id}`);
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['appointments'], 'readonly');
      const store = transaction.objectStore('appointments');
      
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          if (request.result) {
            console.log(`✅ HDS Appointment Service: RDV ${id} trouvé`);
          } else {
            console.log(`⚠️ HDS Appointment Service: RDV ${id} non trouvé`);
          }
          resolve(request.result || null);
        };
        request.onerror = () => {
          console.error(`❌ Erreur HDS getAppointmentById ${id}:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`❌ Erreur HDS getAppointmentById ${id}:`, error);
      return null;
    }
  }

  async getAppointmentsByPatientId(patientId: number): Promise<Appointment[]> {
    console.log(`🏥 HDS Appointment Service: Recherche RDV pour patient ${patientId}`);
    try {
      const allAppointments = await this.getAppointments();
      const patientAppointments = allAppointments.filter(appointment => appointment.patientId === patientId);
      console.log(`✅ HDS Appointment Service: ${patientAppointments.length} RDV trouvés pour patient ${patientId}`);
      return patientAppointments;
    } catch (error) {
      console.error(`❌ Erreur HDS getAppointmentsByPatientId ${patientId}:`, error);
      return [];
    }
  }

  async createAppointment(appointmentData: any): Promise<Appointment> {
    console.log('🏥 HDS Appointment Service: Création RDV', appointmentData);
    try {
      const now = new Date().toISOString();
      const newAppointment: Omit<Appointment, 'id'> = {
        patientId: appointmentData.patientId!,
        cabinetId: appointmentData.cabinetId ?? null,
        osteopathId: appointmentData.osteopathId!,
        date: appointmentData.date ?? now,
        start: appointmentData.start ?? appointmentData.date ?? now,
        end: appointmentData.end ?? new Date(new Date(appointmentData.date || now).getTime() + 30 * 60000).toISOString(),
        reason: appointmentData.reason ?? '',
        status: appointmentData.status ?? 'SCHEDULED',
        notes: appointmentData.notes ?? null,
        createdAt: now,
        updatedAt: now,
        notificationSent: appointmentData.notificationSent ?? false,
      };

      const db = await this.initDB();
      const transaction = db.transaction(['appointments'], 'readwrite');
      const store = transaction.objectStore('appointments');
      
      return new Promise((resolve, reject) => {
        const request = store.add(newAppointment);
        request.onsuccess = () => {
          const created = { ...newAppointment, id: request.result as number };
          console.log('✅ HDS Appointment Service: RDV créé', created);
          resolve(created);
        };
        request.onerror = () => {
          console.error('❌ Erreur HDS createAppointment:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Erreur HDS createAppointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | null> {
    console.log(`🏥 HDS Appointment Service: Mise à jour RDV ${id}`, appointmentData);
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['appointments'], 'readwrite');
      const store = transaction.objectStore('appointments');
      
      // Récupérer d'abord l'enregistrement existant
      const getRequest = store.get(id);
      
      return new Promise((resolve, reject) => {
        getRequest.onsuccess = () => {
          const existingAppointment = getRequest.result;
          if (!existingAppointment) {
            console.log(`⚠️ HDS Appointment Service: RDV ${id} non trouvé pour mise à jour`);
            resolve(null);
            return;
          }
          
          const updated = {
            ...existingAppointment,
            ...appointmentData,
            updatedAt: new Date().toISOString()
          };
          
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => {
            console.log(`✅ HDS Appointment Service: RDV ${id} mis à jour`, updated);
            resolve(updated);
          };
          putRequest.onerror = () => {
            console.error(`❌ Erreur HDS updateAppointment ${id}:`, putRequest.error);
            reject(putRequest.error);
          };
        };
        getRequest.onerror = () => {
          console.error(`❌ Erreur HDS updateAppointment ${id}:`, getRequest.error);
          reject(getRequest.error);
        };
      });
    } catch (error) {
      console.error(`❌ Erreur HDS updateAppointment ${id}:`, error);
      return null;
    }
  }

  async deleteAppointment(id: number): Promise<boolean> {
    console.log(`🏥 HDS Appointment Service: Suppression RDV ${id}`);
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['appointments'], 'readwrite');
      const store = transaction.objectStore('appointments');
      
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
          console.log(`✅ HDS Appointment Service: RDV ${id} supprimé`);
          resolve(true);
        };
        request.onerror = () => {
          console.error(`❌ Erreur HDS deleteAppointment ${id}:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`❌ Erreur HDS deleteAppointment ${id}:`, error);
      return false;
    }
  }
}

export const hdsAppointmentService = new HDSAppointmentService();
import { Invoice, PaymentStatus } from "@/types";

class HDSInvoiceService {
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
        if (!db.objectStoreNames.contains('invoices')) {
          const store = db.createObjectStore('invoices', { keyPath: 'id', autoIncrement: true });
          store.createIndex('patientId', 'patientId', { unique: false });
          store.createIndex('appointmentId', 'appointmentId', { unique: false });
        }
      };
    });
  }

  async getInvoices(): Promise<Invoice[]> {
    console.log('🏥 HDS Invoice Service: Récupération factures depuis stockage local');
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['invoices'], 'readonly');
      const store = transaction.objectStore('invoices');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          console.log(`✅ HDS Invoice Service: ${request.result.length} factures récupérées`);
          resolve(request.result);
        };
        request.onerror = () => {
          console.error('❌ Erreur HDS getInvoices:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Erreur HDS getInvoices:', error);
      throw error;
    }
  }

  async getInvoiceById(id: number): Promise<Invoice | null> {
    console.log(`🏥 HDS Invoice Service: Recherche facture ${id}`);
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['invoices'], 'readonly');
      const store = transaction.objectStore('invoices');
      
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          if (request.result) {
            console.log(`✅ HDS Invoice Service: Facture ${id} trouvée`);
          } else {
            console.log(`⚠️ HDS Invoice Service: Facture ${id} non trouvée`);
          }
          resolve(request.result || null);
        };
        request.onerror = () => {
          console.error(`❌ Erreur HDS getInvoiceById ${id}:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`❌ Erreur HDS getInvoiceById ${id}:`, error);
      return null;
    }
  }

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    console.log(`🏥 HDS Invoice Service: Recherche factures pour patient ${patientId}`);
    try {
      const allInvoices = await this.getInvoices();
      const patientInvoices = allInvoices.filter(invoice => invoice.patientId === patientId);
      console.log(`✅ HDS Invoice Service: ${patientInvoices.length} factures trouvées pour patient ${patientId}`);
      return patientInvoices;
    } catch (error) {
      console.error(`❌ Erreur HDS getInvoicesByPatientId ${patientId}:`, error);
      return [];
    }
  }

  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    console.log(`🏥 HDS Invoice Service: Recherche factures pour RDV ${appointmentId}`);
    try {
      const allInvoices = await this.getInvoices();
      const appointmentInvoices = allInvoices.filter(invoice => invoice.appointmentId === appointmentId);
      console.log(`✅ HDS Invoice Service: ${appointmentInvoices.length} factures trouvées pour RDV ${appointmentId}`);
      return appointmentInvoices;
    } catch (error) {
      console.error(`❌ Erreur HDS getInvoicesByAppointmentId ${appointmentId}:`, error);
      return [];
    }
  }

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    console.log('🏥 HDS Invoice Service: Création facture', invoiceData);
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['invoices'], 'readwrite');
      const store = transaction.objectStore('invoices');
      
      const now = new Date().toISOString();
      const newInvoice: Omit<Invoice, 'id'> = {
        amount: invoiceData.amount ?? 0,
        paymentStatus: (invoiceData.paymentStatus ?? "PENDING") as PaymentStatus,
        date: (invoiceData.date as any) ?? now,
        notes: invoiceData.notes ?? null,
        paymentMethod: invoiceData.paymentMethod ?? null,
        patientId: invoiceData.patientId!,
        appointmentId: invoiceData.appointmentId ?? null,
        osteopathId: invoiceData.osteopathId!,
        cabinetId: invoiceData.cabinetId ?? null,
        createdAt: now as any,
        updatedAt: now as any,
        tvaExoneration: invoiceData.tvaExoneration ?? true,
        tvaMotif: invoiceData.tvaMotif ?? 'TVA non applicable - Article 261-4-1° du CGI'
      };

      return new Promise((resolve, reject) => {
        const request = store.add(newInvoice);
        request.onsuccess = () => {
          const created = { ...newInvoice, id: request.result as number };
          console.log('✅ HDS Invoice Service: Facture créée', created);
          resolve(created);
        };
        request.onerror = () => {
          console.error('❌ Erreur HDS createInvoice:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('❌ Erreur HDS createInvoice:', error);
      throw error;
    }
  }

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | null> {
    console.log(`🏥 HDS Invoice Service: Mise à jour facture ${id}`, invoiceData);
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['invoices'], 'readwrite');
      const store = transaction.objectStore('invoices');
      
      // Récupérer d'abord l'enregistrement existant
      const getRequest = store.get(id);
      
      return new Promise((resolve, reject) => {
        getRequest.onsuccess = () => {
          const existingInvoice = getRequest.result;
          if (!existingInvoice) {
            console.log(`⚠️ HDS Invoice Service: Facture ${id} non trouvée pour mise à jour`);
            resolve(null);
            return;
          }
          
          const updated = {
            ...existingInvoice,
            ...invoiceData,
            updatedAt: new Date().toISOString()
          };
          
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => {
            console.log(`✅ HDS Invoice Service: Facture ${id} mise à jour`, updated);
            resolve(updated);
          };
          putRequest.onerror = () => {
            console.error(`❌ Erreur HDS updateInvoice ${id}:`, putRequest.error);
            reject(putRequest.error);
          };
        };
        getRequest.onerror = () => {
          console.error(`❌ Erreur HDS updateInvoice ${id}:`, getRequest.error);
          reject(getRequest.error);
        };
      });
    } catch (error) {
      console.error(`❌ Erreur HDS updateInvoice ${id}:`, error);
      return null;
    }
  }

  async deleteInvoice(id: number): Promise<boolean> {
    console.log(`🏥 HDS Invoice Service: Suppression facture ${id}`);
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['invoices'], 'readwrite');
      const store = transaction.objectStore('invoices');
      
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => {
          console.log(`✅ HDS Invoice Service: Facture ${id} supprimée`);
          resolve(true);
        };
        request.onerror = () => {
          console.error(`❌ Erreur HDS deleteInvoice ${id}:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`❌ Erreur HDS deleteInvoice ${id}:`, error);
      return false;
    }
  }
}

export const hdsInvoiceService = new HDSInvoiceService();
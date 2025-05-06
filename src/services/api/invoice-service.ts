
import { Invoice, PaymentStatus } from '@/types';

// Données de démonstration
const invoices: Invoice[] = [
  {
    id: 1,
    patientId: 1,
    appointmentId: 1,
    amount: 60.0,
    date: new Date().toISOString(),
    paymentStatus: "PENDING",
    paymentMethod: "CB",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    patientId: 2,
    appointmentId: 3,
    amount: 60.0,
    date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    paymentStatus: "PAID",
    paymentMethod: "ESPECES",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Récupérer toutes les factures
export const getInvoices = async (): Promise<Invoice[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...invoices];
};

// Récupérer une facture par ID
export const getInvoiceById = async (id: number): Promise<Invoice | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const invoice = invoices.find(i => i.id === id);
  return invoice || null;
};

// Créer une nouvelle facture
export const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newInvoice: Invoice = {
    ...invoiceData,
    id: invoices.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  invoices.push(newInvoice);
  return newInvoice;
};

// Mettre à jour une facture
export const updateInvoice = async (id: number, invoiceData: Partial<Invoice>): Promise<Invoice> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = invoices.findIndex(i => i.id === id);
  if (index !== -1) {
    invoices[index] = {
      ...invoices[index],
      ...invoiceData,
      updatedAt: new Date().toISOString()
    };
    return invoices[index];
  }
  
  throw new Error(`Invoice with ID ${id} not found`);
};

// Supprimer une facture
export const deleteInvoice = async (id: number): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = invoices.findIndex(i => i.id === id);
  if (index !== -1) {
    invoices.splice(index, 1);
    return true;
  }
  
  return false;
};

// Récupérer les factures par patient ID
export const getInvoicesByPatientId = async (patientId: number): Promise<Invoice[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return invoices.filter(i => i.patientId === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Récupérer les factures par ostéopathe ID
export const getInvoicesByOsteopathId = async (osteopathId: number): Promise<Invoice[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  // Dans un vrai système, nous filtrerions par ostéopathe ID
  // Comme nos données mock n'ont pas de champ ostéopathe, nous retournons tout
  return [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Compter le nombre de factures
export const getInvoiceCount = async (): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return invoices.length;
};

// Marquer une facture comme payée
export const markInvoiceAsPaid = async (id: number, paymentMethod: string): Promise<Invoice> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = invoices.findIndex(i => i.id === id);
  if (index !== -1) {
    invoices[index] = {
      ...invoices[index],
      paymentStatus: "PAID",
      paymentMethod,
      updatedAt: new Date().toISOString()
    };
    return invoices[index];
  }
  
  throw new Error(`Invoice with ID ${id} not found`);
};

// Récupérer les factures par rendez-vous ID
export const getInvoicesByAppointmentId = async (appointmentId: number): Promise<Invoice[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return invoices.filter(i => i.appointmentId === appointmentId);
};

// Exporter le service
export const invoiceService = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByPatientId,
  getInvoicesByOsteopathId,
  getInvoiceCount,
  markInvoiceAsPaid,
  getInvoicesByAppointmentId
};

export default invoiceService;

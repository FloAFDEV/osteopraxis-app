import { DemoStorage } from './demo-storage';
import { Patient, Appointment, Invoice, Cabinet } from '@/types';

export function seedDemoData(cabinetId: string, userId: string, cabinetName: string): void {
  const now = new Date();

  // Données ostéopathe démo (pour affichage lecture seule)
  const demoOsteopath = {
    id: userId, // UUID en mode démo
    userId: userId,
    name: 'Dr. Utilisateur Démo',
    professional_title: 'Ostéopathe D.O.',
    rpps_number: '10001234567',
    siret: '12345678900012',
    ape_code: '8690F',
    plan: 'demo' as const,
    status: 'demo' as const,
    demo_started_at: now.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const cabinet: Cabinet = {
    id: cabinetId,
    name: cabinetName,
    address: '12 Rue de la République',
    city: 'Toulouse',
    postalCode: '31000',
    phone: '05 61 00 00 00',
    email: 'demo@osteopraxis.fr',
    siret: '12345678900012',
    iban: null,
    bic: null,
    country: 'France',
    osteopathId: userId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    imageUrl: null
  };

  const patients: Patient[] = [
    {
      id: crypto.randomUUID(),
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '06 12 34 56 78',
      birthDate: '1985-05-15',
      address: '5 Avenue des Champs',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@example.com',
      phone: '06 98 76 54 32',
      birthDate: '1990-08-22',
      address: '8 Boulevard Victor Hugo',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Pierre',
      lastName: 'Durand',
      email: 'pierre.durand@example.com',
      phone: '06 45 67 89 01',
      birthDate: '1978-11-30',
      address: '15 Rue Jean Jaurès',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 30, 0, 0);

  const appointments: Appointment[] = [
    {
      id: crypto.randomUUID(),
      patientId: patients[0].id,
      osteopathId: userId,
      cabinetId: cabinetId,
      dateTime: tomorrow.toISOString(),
      duration: 60,
      status: 'scheduled',
      notes: 'Consultation initiale - Douleurs lombaires',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      patientId: patients[1].id,
      osteopathId: userId,
      cabinetId: cabinetId,
      dateTime: nextWeek.toISOString(),
      duration: 45,
      status: 'scheduled',
      notes: 'Suivi - Tensions cervicales',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const invoices: Invoice[] = [
    {
      id: crypto.randomUUID(),
      patientId: patients[2].id,
      osteopathId: userId,
      cabinetId: cabinetId,
      invoiceNumber: 'DEMO-001',
      date: lastWeek.toISOString(),
      amount: 60,
      status: 'paid',
      description: 'Consultation ostéopathie',
      paymentMethod: 'cash',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  console.log('🌱 [seedDemoData] Création des données démo pour cabinetId:', cabinetId);
  console.log('🏢 [seedDemoData] Cabinet créé:', cabinet);
  console.log('👤 [seedDemoData] Ostéopathe créé:', demoOsteopath);
  DemoStorage.set(cabinetId, 'osteopath', demoOsteopath);
  DemoStorage.set(cabinetId, 'cabinet', cabinet);
  DemoStorage.set(cabinetId, 'patients', patients);
  DemoStorage.set(cabinetId, 'appointments', appointments);
  DemoStorage.set(cabinetId, 'invoices', invoices);
  console.log('✅ [seedDemoData] Données démo créées avec succès');
}

import { DemoStorage } from './demo-storage';
import { Patient, Appointment, Invoice, Cabinet } from '@/types';

/**
 * 🌱 Génère des données de démonstration avec des dates dynamiques
 *
 * Cette fonction est appelée à chaque chargement de page pour garantir que :
 * - Les rendez-vous passés couvrent toujours les 12 derniers mois
 * - Les rendez-vous futurs sont toujours dans le futur (J+1 à J+14)
 * - Les factures correspondent aux rendez-vous avec des dates cohérentes
 * - Les statistiques du dashboard restent pertinentes même après plusieurs mois
 *
 * Les données sont régénérées dynamiquement basées sur new Date() actuelle.
 */
export function seedDemoData(cabinetId: string, userId: string, cabinetName: string): void {
  const now = new Date();

  // Données ostéopathe démo (pour affichage lecture seule)
  const demoOsteopath = {
    id: userId,
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

  // 10 patients démo avec données variées (incluant 2 enfants)
  const patients: Patient[] = [
    {
      id: crypto.randomUUID(),
      firstName: 'Jean',
      lastName: 'Dupont',
      gender: 'M',
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
      gender: 'F',
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
      gender: 'M',
      email: 'pierre.durand@example.com',
      phone: '06 45 67 89 01',
      birthDate: '1978-11-30',
      address: '15 Rue Jean Jaurès',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Sophie',
      lastName: 'Bernard',
      gender: 'F',
      email: 'sophie.bernard@example.com',
      phone: '06 23 45 67 89',
      birthDate: '1982-03-10',
      address: '22 Rue Lafayette',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Lucas',
      lastName: 'Petit',
      gender: 'M',
      email: 'lucas.petit@example.com',
      phone: '06 34 56 78 90',
      birthDate: '1995-07-18',
      address: '7 Place du Capitole',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Emma',
      lastName: 'Roux',
      gender: 'F',
      email: 'emma.roux@example.com',
      phone: '06 56 78 90 12',
      birthDate: '1988-12-05',
      address: '33 Allée Jean Jaurès',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Thomas',
      lastName: 'Moreau',
      gender: 'M',
      email: 'thomas.moreau@example.com',
      phone: '06 67 89 01 23',
      birthDate: '1992-09-14',
      address: '18 Rue Alsace Lorraine',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Chloé',
      lastName: 'Simon',
      gender: 'F',
      email: 'chloe.simon@example.com',
      phone: '06 78 90 12 34',
      birthDate: '1987-04-28',
      address: '9 Rue de Metz',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Alexandre',
      lastName: 'Laurent',
      gender: 'M',
      email: 'alexandre.laurent@example.com',
      phone: '06 89 01 23 45',
      birthDate: '1980-11-20',
      address: '44 Avenue de la Gloire',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Léa',
      lastName: 'Lefebvre',
      gender: 'F',
      email: 'lea.lefebvre@example.com',
      phone: '06 90 12 34 56',
      birthDate: '1993-06-12',
      address: '11 Rue Rémusat',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Manon',
      lastName: 'Dubois',
      gender: 'F',
      email: 'manon.dubois@example.com',
      phone: '06 11 22 33 44',
      birthDate: '2015-03-20',
      address: '28 Rue des Écoles',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Hugo',
      lastName: 'Gauthier',
      gender: 'M',
      email: 'hugo.gauthier@example.com',
      phone: '06 55 66 77 88',
      birthDate: '2018-09-10',
      address: '14 Avenue des Enfants',
      city: 'Toulouse',
      postalCode: '31000',
      osteopathId: userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const appointments: Appointment[] = [];
  const invoices: Invoice[] = [];

  // Créer 30 consultations passées (sur les 12 derniers mois)
  const reasons = [
    'Douleurs lombaires',
    'Tensions cervicales',
    'Migraines',
    'Sciatique',
    'Entorse cheville',
    'Stress et anxiété',
    'Troubles du sommeil',
    'Douleurs épaule',
    'Suivi régulier',
    'Consultation post-opératoire'
  ];

  for (let i = 0; i < 30; i++) {
    const daysAgo = Math.floor(Math.random() * 365); // Derniers 12 mois
    const appointmentDate = new Date(now);
    appointmentDate.setDate(appointmentDate.getDate() - daysAgo);
    appointmentDate.setHours(9 + Math.floor(Math.random() * 9), [0, 15, 30, 45][Math.floor(Math.random() * 4)], 0, 0);

    const randomPatient = patients[Math.floor(Math.random() * patients.length)];
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];

    appointments.push({
      id: crypto.randomUUID(),
      patientId: randomPatient.id,
      osteopathId: userId,
      cabinetId: cabinetId,
      date: appointmentDate.toISOString(),
      status: 'COMPLETED',
      reason: randomReason,
      notes: `Consultation du ${appointmentDate.toLocaleDateString('fr-FR')}`,
      notificationSent: true,
      createdAt: appointmentDate.toISOString(),
      updatedAt: appointmentDate.toISOString()
    });
  }

  // Créer 28 factures correspondant aux consultations passées
  // Distribution : 22 payées, 4 en attente, 2 annulées (pour montrer toutes les fonctionnalités)
  const amounts = [55, 60, 65, 70];
  const paymentMethods = ['cash', 'check', 'card', 'transfer'];
  const invoiceStatuses: Array<'PAID' | 'PENDING' | 'CANCELED'> = [
    ...Array(22).fill('PAID'),      // 22 factures payées (≈79%)
    ...Array(4).fill('PENDING'),    // 4 factures en attente (≈14%)
    ...Array(2).fill('CANCELED')    // 2 factures annulées (≈7%)
  ];

  for (let i = 0; i < 28; i++) {
    const randomAppointment = appointments[i];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
    const randomPayment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const invoiceStatus = invoiceStatuses[i];

    invoices.push({
      id: crypto.randomUUID(),
      patientId: randomAppointment.patientId,
      appointmentId: randomAppointment.id,
      osteopathId: userId,
      cabinetId: cabinetId,
      invoiceNumber: `DEMO-${String(i + 1).padStart(3, '0')}`,
      date: randomAppointment.date,
      amount: randomAmount,
      paymentStatus: invoiceStatus,
      description: 'Consultation ostéopathie',
      paymentMethod: invoiceStatus === 'PAID' ? randomPayment as any : null,
      createdAt: randomAppointment.createdAt,
      updatedAt: randomAppointment.updatedAt
    });
  }

  // Ajouter 3 rendez-vous pour AUJOURD'HUI (à différentes heures)
  const todayTimes = [
    { hour: 9, minute: 0, status: 'COMPLETED' as const },
    { hour: 14, minute: 30, status: 'SCHEDULED' as const },
    { hour: 16, minute: 0, status: 'SCHEDULED' as const }
  ];

  todayTimes.forEach((time, index) => {
    const todayDate = new Date(now);
    todayDate.setHours(time.hour, time.minute, 0, 0);

    const randomPatient = patients[index % patients.length];

    appointments.push({
      id: crypto.randomUUID(),
      patientId: randomPatient.id,
      osteopathId: userId,
      cabinetId: cabinetId,
      date: todayDate.toISOString(),
      status: time.status,
      reason: reasons[index % reasons.length],
      notes: time.status === 'COMPLETED' ? 'Séance terminée' : '',
      notificationSent: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  });

  // Ajouter 5 rendez-vous futurs (J+1 à J+14)
  const futureDates = [1, 2, 5, 8, 14]; // jours dans le futur
  futureDates.forEach((daysLater, index) => {
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + daysLater);
    futureDate.setHours(9 + (index * 2), 0, 0, 0);

    const randomPatient = patients[(index + 3) % patients.length]; // Décaler pour varier les patients

    appointments.push({
      id: crypto.randomUUID(),
      patientId: randomPatient.id,
      osteopathId: userId,
      cabinetId: cabinetId,
      date: futureDate.toISOString(),
      status: 'SCHEDULED',
      reason: reasons[index % reasons.length],
      notes: '',
      notificationSent: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  });

  console.log('🌱 [seedDemoData] Création des données démo pour cabinetId:', cabinetId);
  console.log('🏢 [seedDemoData] Cabinet créé:', cabinet);
  console.log('👤 [seedDemoData] Ostéopathe créé:', demoOsteopath);
  console.log('👥 [seedDemoData] Patients créés:', patients.length, '(dont 2 enfants)');
  console.log('📅 [seedDemoData] Rendez-vous créés:', appointments.length, `(30 passés + 3 aujourd'hui + 5 futurs)`);
  console.log('💰 [seedDemoData] Factures créées:', invoices.length, '(22 payées, 4 en attente, 2 en retard)');

  DemoStorage.set(cabinetId, 'osteopath', demoOsteopath);
  DemoStorage.set(cabinetId, 'cabinet', cabinet);
  DemoStorage.set(cabinetId, 'patients', patients);
  DemoStorage.set(cabinetId, 'appointments', appointments);
  DemoStorage.set(cabinetId, 'invoices', invoices);
  console.log('✅ [seedDemoData] Données démo créées avec succès');
}

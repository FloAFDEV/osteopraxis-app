
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabaseOsteopathService } from "../../supabase-api/osteopath-service";
import { supabasePatientService } from "../../supabase-api/patient-service";
import { supabaseCabinetService } from "../../supabase-api/cabinet-service";
import { supabaseInvoiceService } from "../../supabase-api/invoice-service";
import { supabaseAppointmentService } from "../../supabase-api/appointment-service";
import { supabase } from "../../supabase-api/utils";

// Utilisateur et IDs fictifs utilisés pour lier les entités
const OSTEO_TEST_EMAIL = "crudemotest@example.com";
let osteoId: number | undefined;
let patientId: number | undefined;
let cabinetId: number | undefined;
let invoiceId: number | undefined;
let appointmentId: number | undefined;

// Données de base pour l'ostéopathe fictif
const osteoDemo = {
  userId: "test-user-crud-uuid",
  updatedAt: new Date().toISOString(),
  ape_code: "8690F",
  name: "Ostéopathe Crud Demo",
  professional_title: "Ostéopathe D.O.",
  adeli_number: "ADELI1234",
  createdAt: new Date().toISOString(),
  siret: "SIRET123456789"
};

describe("Tests d'intégration CRUD sur Supabase (Osteopath, Patient, Cabinet, Invoice, Appointment)", () => {

  beforeAll(async () => {
    // Nettoyer toute donnée précédente avec des champs de test
    await supabase.from("Cabinet").delete().eq("address", "Adresse de test CRUD");
    await supabase.from("Patient").delete().eq("email", "crudpatient@example.com");
    await supabase.from("Osteopath").delete().eq("name", "Ostéopathe Crud Demo");

    // Créer un ostéopathe de test
    const osteopath = await supabaseOsteopathService.createOsteopath(osteoDemo);
    osteoId = osteopath.id;
    expect(osteopath).toBeDefined();
    expect(osteopath.name).toBe(osteoDemo.name);
  });

  afterAll(async () => {
    // Nettoyage complet (attention, ici suppression brute via les champs test)
    if (appointmentId) await supabase.from("Appointment").delete().eq("id", appointmentId);
    if (invoiceId) await supabase.from("Invoice").delete().eq("id", invoiceId);
    if (cabinetId) await supabase.from("Cabinet").delete().eq("id", cabinetId);
    if (patientId) await supabase.from("Patient").delete().eq("id", patientId);
    if (osteoId) await supabase.from("Osteopath").delete().eq("id", osteoId);
  });

  it("CRUD ostéopathe", async () => {
    expect(osteoId).toBeDefined();
    const fetched = await supabaseOsteopathService.getOsteopathById(osteoId!);
    expect(fetched).toBeDefined();
    expect(fetched!.name).toBe("Ostéopathe Crud Demo");

    // Update
    await supabaseOsteopathService.updateOsteopath(osteoId!, { name: "Ostéo MAJ" });
    const fetchedUpdated = await supabaseOsteopathService.getOsteopathById(osteoId!);
    expect(fetchedUpdated!.name).toBe("Ostéo MAJ");
  });

  it("CRUD patient", async () => {
    // Création
    const patient = await supabasePatientService.createPatient({
      firstName: "Patient",
      lastName: "Crud",
      email: "crudpatient@example.com",
      phone: "0123456789",
      address: "Adresse patient CRUD",
      gender: "Homme",
      birthDate: new Date().toISOString(),
      maritalStatus: "SINGLE",
      occupation: "Etudiant",
      hasChildren: "Non",
      childrenAges: null,
      generalPractitioner: null,
      surgicalHistory: null,
      traumaHistory: null,
      rheumatologicalHistory: null,
      currentTreatment: null,
      handedness: "RIGHT",
      hasVisionCorrection: false,
      ophtalmologistName: null,
      entProblems: null,
      entDoctorName: null,
      digestiveProblems: null,
      digestiveDoctorName: null,
      physicalActivity: null,
      isSmoker: false,
      isDeceased: false,
      contraception: "NONE",
      hdlm: null,
      avatarUrl: null,
      cabinetId: null,
      userId: null,
      osteopathId: osteoId
    });
    patientId = patient.id;
    expect(patientId).toBeDefined();

    // Lecture
    const patientFetched = await supabasePatientService.getPatientById(patientId!);
    expect(patientFetched).toBeDefined();
    expect(patientFetched!.email).toBe("crudpatient@example.com");

    // Update
    patientFetched!.firstName = "NouveauNom";
    const updatedPatient = await supabasePatientService.updatePatient(patientFetched!);
    expect(updatedPatient.firstName).toBe("NouveauNom");
  });

  it("CRUD cabinet", async () => {
    // Création
    const cabinet = await supabaseCabinetService.createCabinet({
      name: "Cabinet Test CRUD",
      address: "Adresse de test CRUD",
      phone: "0123465789",
      imageUrl: null,
      logoUrl: null,
      osteopathId: osteoId!
    });
    cabinetId = cabinet.id;
    expect(cabinetId).toBeDefined();

    // Lecture
    const cabinets = await supabaseCabinetService.getCabinetsByOsteopathId(osteoId!);
    expect(cabinets.length).toBeGreaterThan(0);

    // Update
    await supabaseCabinetService.updateCabinet(cabinetId!, { name: "Cabinet MAJ" });
    const cabFetchedUpdated = await supabaseCabinetService.getCabinetById(cabinetId!);
    expect(cabFetchedUpdated!.name).toBe("Cabinet MAJ");
  });

  it("CRUD facture (invoice)", async () => {
    // Création
    const invoice = await supabaseInvoiceService.createInvoice({
      patientId: patientId!,
      appointmentId: 1, // Changed from consultationId to appointmentId
      date: new Date().toISOString(),
      amount: 65,
      paymentStatus: "PENDING"
    });
    invoiceId = invoice.id;
    expect(invoiceId).toBeDefined();

    // Lecture
    const invoiceFetched = await supabaseInvoiceService.getInvoiceById(invoiceId!);
    expect(invoiceFetched).toBeDefined();
    expect(invoiceFetched!.amount).toBe(65);

    // Update
    const updatedInvoice = await supabaseInvoiceService.updateInvoice(invoiceId!, { amount: 80 });
    expect(updatedInvoice!.amount).toBe(80);
  });

  it("CRUD rendez-vous (appointment)", async () => {
    // Création
    const appointment = await supabaseAppointmentService.createAppointment({
      patientId: patientId!,
      date: new Date().toISOString(),
      status: "SCHEDULED",
      reason: "Test CRUD rendez-vous",
      notificationSent: false
    });
    appointmentId = appointment.id;
    expect(appointmentId).toBeDefined();

    // Lecture
    const apptFetched = await supabaseAppointmentService.getAppointmentById(appointmentId!);
    expect(apptFetched).toBeDefined();
    expect(apptFetched!.status).toBe("SCHEDULED");

    // Update
    const updated = await supabaseAppointmentService.updateAppointment(appointmentId!, { status: "COMPLETED" });
    expect(updated.status).toBe("COMPLETED");
  });
});

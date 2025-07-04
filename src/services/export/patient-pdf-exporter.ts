import { Tables } from "@/integrations/supabase/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Patient = Tables<"Patient">;

interface ExportOptions {
  includePersonalInfo?: boolean;
  includeMedicalHistory?: boolean;
  includeAppointments?: boolean;
  includeInvoices?: boolean;
  includePhotos?: boolean;
}

export class PatientPDFExporter {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;

  constructor() {
    this.pdf = new jsPDF();
  }

  private addHeader(patientName: string) {
    this.pdf.setFontSize(20);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text("DOSSIER PATIENT", this.margin, this.currentY);
    
    this.currentY += 10;
    this.pdf.setFontSize(16);
    this.pdf.text(patientName, this.margin, this.currentY);
    
    this.currentY += 10;
    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.text(`Généré le ${format(new Date(), "PPPP", { locale: fr })}`, this.margin, this.currentY);
    
    this.currentY += 15;
    this.addLine();
  }

  private addLine() {
    this.pdf.line(this.margin, this.currentY, 190, this.currentY);
    this.currentY += 10;
  }

  private addSection(title: string) {
    this.checkPageBreak(20);
    this.pdf.setFontSize(14);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 8;
    this.addLine();
  }

  private addField(label: string, value: string | null | undefined) {
    if (!value || value === "NULL") return;
    
    this.checkPageBreak(10);
    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(`${label}:`, this.margin, this.currentY);
    
    this.pdf.setFont("helvetica", "normal");
    const lines = this.pdf.splitTextToSize(value, 120);
    this.pdf.text(lines, this.margin + 50, this.currentY);
    
    this.currentY += lines.length * 5 + 3;
  }

  private checkPageBreak(spaceNeeded: number) {
    if (this.currentY + spaceNeeded > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  private addPersonalInfo(patient: Patient) {
    this.addSection("INFORMATIONS PERSONNELLES");
    
    this.addField("Nom", patient.lastName);
    this.addField("Prénom", patient.firstName);
    this.addField("Date de naissance", patient.birthDate ? format(new Date(patient.birthDate), "dd/MM/yyyy") : null);
    this.addField("Genre", patient.gender);
    this.addField("Adresse", patient.address);
    this.addField("Ville", patient.city);
    this.addField("Code postal", patient.postalCode);
    this.addField("Téléphone", patient.phone);
    this.addField("Email", patient.email);
    this.addField("Profession", patient.occupation || patient.job);
    this.addField("Statut marital", patient.maritalStatus);
  }

  private addMedicalHistory(patient: Patient) {
    this.addSection("ANTÉCÉDENTS MÉDICAUX");
    
    this.addField("Historique médical", patient.medicalHistory);
    this.addField("Historique chirurgical", patient.surgicalHistory);
    this.addField("Historique traumatique", patient.traumaHistory);
    this.addField("Allergies", patient.allergies);
    this.addField("Médication actuelle", patient.currentMedication);
    this.addField("Traitement actuel", patient.currentTreatment);
    this.addField("Médecin traitant", patient.generalPractitioner);
    
    // Données biométriques
    this.addSection("DONNÉES BIOMÉTRIQUES");
    this.addField("Taille", patient.height ? `${patient.height} cm` : null);
    this.addField("Poids", patient.weight ? `${patient.weight} kg` : null);
    this.addField("IMC", patient.bmi ? patient.bmi.toString() : null);
    
    // Habitudes de vie
    this.addSection("HABITUDES DE VIE");
    this.addField("Fumeur", patient.isSmoker ? "Oui" : "Non");
    if (patient.isSmoker && patient.smokingSince) {
      this.addField("Fume depuis", patient.smokingSince);
    }
    this.addField("Activité physique", patient.physicalActivity);
    this.addField("Consommation d'alcool", patient.alcoholConsumption);
  }

  private addExaminations(patient: Patient) {
    this.addSection("EXAMENS CLINIQUES");
    
    // Examens généraux
    this.addField("Examen médical", patient.medical_examination);
    this.addField("Examen crânien", patient.cranial_exam);
    this.addField("Examen dentaire", patient.dental_exam);
    this.addField("Examen facial", patient.facial_mask_exam);
    this.addField("Examen fascia", patient.fascia_exam);
    this.addField("Examen vasculaire", patient.vascular_exam);
    this.addField("Membre supérieur", patient.upper_limb_exam);
    this.addField("Membre inférieur", patient.lower_limb_exam);
    this.addField("Épaule", patient.shoulder_exam);
    this.addField("Scoliose", patient.scoliosis);
    
    // Plan de traitement
    this.addSection("DIAGNOSTIC ET TRAITEMENT");
    this.addField("Diagnostic", patient.diagnosis);
    this.addField("Plan de traitement", patient.treatment_plan);
    this.addField("Conclusion consultation", patient.consultation_conclusion);
    this.addField("Examens complémentaires", patient.complementaryExams);
    this.addField("Notes générales", patient.notes);
  }

  async exportPatient(
    patient: Patient, 
    options: ExportOptions = {},
    appointments?: any[],
    invoices?: any[]
  ): Promise<void> {
    const {
      includePersonalInfo = true,
      includeMedicalHistory = true,
      includeAppointments = true,
      includeInvoices = true,
    } = options;

    // Header
    this.addHeader(`${patient.firstName} ${patient.lastName}`);

    // Sections conditionnelles
    if (includePersonalInfo) {
      this.addPersonalInfo(patient);
    }

    if (includeMedicalHistory) {
      this.addMedicalHistory(patient);
      this.addExaminations(patient);
    }

    if (includeAppointments && appointments?.length) {
      this.addSection("HISTORIQUE DES RENDEZ-VOUS");
      appointments.forEach((appointment, index) => {
        this.checkPageBreak(15);
        this.pdf.setFontSize(12);
        this.pdf.setFont("helvetica", "bold");
        this.pdf.text(`RDV ${index + 1}`, this.margin, this.currentY);
        this.currentY += 6;
        
        this.addField("Date", format(new Date(appointment.date), "PPPP 'à' HH:mm", { locale: fr }));
        this.addField("Motif", appointment.reason);
        this.addField("Statut", appointment.status);
        this.addField("Notes", appointment.notes);
        this.currentY += 5;
      });
    }

    if (includeInvoices && invoices?.length) {
      this.addSection("HISTORIQUE DE FACTURATION");
      let totalAmount = 0;
      
      invoices.forEach((invoice, index) => {
        this.checkPageBreak(15);
        this.pdf.setFontSize(12);
        this.pdf.setFont("helvetica", "bold");
        this.pdf.text(`Facture ${index + 1}`, this.margin, this.currentY);
        this.currentY += 6;
        
        this.addField("Date", format(new Date(invoice.date), "dd/MM/yyyy"));
        this.addField("Montant", `${invoice.amount} €`);
        this.addField("Statut", invoice.paymentStatus);
        this.addField("Mode de paiement", invoice.paymentMethod);
        totalAmount += invoice.amount;
        this.currentY += 5;
      });
      
      this.checkPageBreak(10);
      this.pdf.setFont("helvetica", "bold");
      this.pdf.text(`Total facturé: ${totalAmount} €`, this.margin, this.currentY);
    }

    // Télécharger le PDF
    const fileName = `dossier_${patient.firstName}_${patient.lastName}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    this.pdf.save(fileName);
  }

  // Méthode pour exporter via HTML (pour des layouts complexes)
  async exportFromHTML(element: HTMLElement, filename: string): Promise<void> {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  }
}
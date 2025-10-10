import { Tables } from "@/integrations/supabase/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Appointment, Invoice, Cabinet, Osteopath } from "@/types";
import { exportSecurity } from "@/utils/export-utils";

type Patient = Tables<"Patient">;

interface PatientExportData {
	patient: Patient;
	appointments?: Appointment[];
	invoices?: Invoice[];
	osteopath?: Osteopath;
	cabinet?: Cabinet;
}

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
	private pageHeight: number = 297;
	private margin: number = 20;

	constructor() {
		this.pdf = new jsPDF();
	}

	private addFooter() {
		this.pdf.setFontSize(8);
		this.pdf.setTextColor(150);
		this.pdf.text(
			`Page ${this.pdf.getCurrentPageInfo().pageNumber}`,
			this.pdf.internal.pageSize.getWidth() - this.margin,
			this.pdf.internal.pageSize.getHeight() - 10,
			{ align: "right" }
		);
		this.pdf.setTextColor(0); // reset color
	}

	private checkPageBreak(spaceNeeded: number) {
		if (this.currentY + spaceNeeded > this.pageHeight - this.margin) {
			this.addFooter();
			this.pdf.addPage();
			this.currentY = this.margin;
		}
	}

	private addHeaderComplete(
		patientName: string,
		osteopath?: Osteopath,
		cabinet?: Cabinet
	) {
		if (cabinet) {
			this.pdf.setFontSize(12);
			this.pdf.setFont("helvetica", "bold");
			this.pdf.text(cabinet.name, 190, this.currentY, { align: "right" });

			this.pdf.setFontSize(9);
			this.pdf.setFont("helvetica", "normal");
			this.pdf.text(cabinet.address, 190, this.currentY + 5, {
				align: "right",
			});
			if (cabinet.phone)
				this.pdf.text(
					`Tél: ${cabinet.phone}`,
					190,
					this.currentY + 10,
					{ align: "right" }
				);
			if (cabinet.email)
				this.pdf.text(
					`Email: ${cabinet.email}`,
					190,
					this.currentY + 15,
					{ align: "right" }
				);

			this.currentY += 25;
		}

		this.pdf.setFontSize(20);
		this.pdf.setFont("helvetica", "bold");
		this.pdf.text(
			"DOSSIER MÉDICAL OSTÉOPATHIQUE",
			this.margin,
			this.currentY
		);

		this.currentY += 12;
		this.pdf.setFontSize(16);
		this.pdf.text(patientName, this.margin, this.currentY);

		this.currentY += 8;
		this.pdf.setFontSize(10);
		this.pdf.setFont("helvetica", "normal");
		this.pdf.text(
			`Document généré le ${format(new Date(), "PPPP", { locale: fr })}`,
			this.margin,
			this.currentY
		);

		if (osteopath) {
			this.currentY += 5;
			this.pdf.text(
				`Praticien: ${osteopath.name}`,
				this.margin,
				this.currentY
			);
			if (osteopath.rpps_number) {
				this.pdf.text(
					`RPPS: ${osteopath.rpps_number}`,
					this.margin + 100,
					this.currentY
				);
			}
		}

		this.currentY += 10;
		this.pdf.text(
			"Document confidentiel - Usage professionnel uniquement",
			this.margin,
			this.currentY
		);
		this.currentY += 10;
		this.addLine();
	}

	private addLine() {
		this.pdf.line(this.margin, this.currentY, 190, this.currentY);
		this.currentY += 10;
	}

	private addSection(title: string) {
		this.checkPageBreak(20);
		this.currentY += 4;
		this.pdf.setFontSize(14);
		this.pdf.setFont("helvetica", "bold");
		this.pdf.setTextColor(0);
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

		this.currentY += lines.length * 4.5 + 2;
	}

	private addTwoFields(
		label1: string,
		value1: string,
		label2: string,
		value2: string
	) {
		if (!value1 && !value2) return;
		this.checkPageBreak(10);
		this.pdf.setFontSize(10);
		this.pdf.setFont("helvetica", "bold");
		this.pdf.text(`${label1}:`, this.margin, this.currentY);
		this.pdf.text(`${label2}:`, this.margin + 80, this.currentY);

		this.pdf.setFont("helvetica", "normal");
		this.pdf.text(value1 || "-", this.margin + 30, this.currentY);
		this.pdf.text(value2 || "-", this.margin + 110, this.currentY);

		this.currentY += 6;
	}

	private addPersonalInfo(patient: Patient) {
		this.addSection("INFORMATIONS PERSONNELLES");
		this.addField("Nom", patient.lastName);
		this.addField("Prénom", patient.firstName);
		this.addField(
			"Date de naissance",
			patient.birthDate
				? format(new Date(patient.birthDate), "dd/MM/yyyy")
				: null
		);
		this.addField("Genre", patient.gender);
		this.addField("Adresse", patient.address);
		this.addTwoFields(
			"Ville",
			patient.city,
			"Code postal",
			patient.postalCode
		);
		this.addTwoFields("Téléphone", patient.phone, "Email", patient.email);
		this.addTwoFields(
			"Profession",
			patient.occupation || patient.job || "-",
			"Statut marital",
			patient.maritalStatus || "-"
		);
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

		this.addSection("DONNÉES BIOMÉTRIQUES");
		this.addTwoFields(
			"Taille",
			`${patient.height || "-"} cm`,
			"Poids",
			`${patient.weight || "-"} kg`
		);
		this.addField("IMC", patient.bmi ? patient.bmi.toString() : null);

		this.addSection("HABITUDES DE VIE");
		this.addField("Fumeur", patient.isSmoker ? "Oui" : "Non");
		if (patient.isSmoker && patient.smokingSince)
			this.addField("Fume depuis", patient.smokingSince);
		this.addField("Activité physique", patient.physicalActivity);
		this.addField("Consommation d'alcool", patient.alcoholConsumption);
	}

	private addExaminations(patient: Patient) {
		this.addSection("EXAMENS CLINIQUES");
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

		this.addSection("DIAGNOSTIC ET TRAITEMENT");
		this.addField("Diagnostic", patient.diagnosis);
		this.addField("Plan de traitement", patient.treatment_plan);
		this.addField(
			"Conclusion consultation",
			patient.consultation_conclusion
		);
		this.addField("Examens complémentaires", patient.complementaryExams);
		this.addField("Notes générales", patient.notes);
	}

	async exportPatientComplete(
		data: PatientExportData,
		options: ExportOptions = {}
	): Promise<void> {
		const {
			patient,
			appointments = [],
			invoices = [],
			osteopath,
			cabinet,
		} = data;
		const {
			includePersonalInfo = true,
			includeMedicalHistory = true,
			includeAppointments = true,
			includeInvoices = true,
		} = options;

		this.addHeaderComplete(
			`${patient.firstName} ${patient.lastName}`,
			osteopath,
			cabinet
		);

		if (includePersonalInfo) this.addPersonalInfo(patient);
		if (includeMedicalHistory) {
			this.addMedicalHistory(patient);
			this.addExaminations(patient);
		}

		if (includeAppointments && appointments.length) {
			this.addSection("HISTORIQUE DES RENDEZ-VOUS");
			appointments.forEach((a, i) => {
				this.checkPageBreak(15);
				this.pdf.setFontSize(12);
				this.pdf.setFont("helvetica", "bold");
				this.pdf.text(`RDV ${i + 1}`, this.margin, this.currentY);
				this.currentY += 6;
				this.addField(
					"Date",
					format(new Date(a.date), "PPPP 'à' HH:mm", { locale: fr })
				);
				this.addField("Motif", a.reason);
				this.addField("Statut", a.status);
				this.addField("Notes", a.notes);
				this.currentY += 5;
			});
		}

		if (includeInvoices && invoices.length) {
			this.addSection("HISTORIQUE DE FACTURATION");
			let total = 0;
			invoices.forEach((inv, i) => {
				this.checkPageBreak(15);
				this.pdf.setFontSize(12);
				this.pdf.setFont("helvetica", "bold");
				this.pdf.text(`Facture ${i + 1}`, this.margin, this.currentY);
				this.currentY += 6;
				this.addField("Date", format(new Date(inv.date), "dd/MM/yyyy"));
				this.addField("Montant", `${inv.amount} €`);
				this.addField("Statut", inv.paymentStatus);
				this.addField("Mode de paiement", inv.paymentMethod);
				total += inv.amount;
				this.currentY += 5;
			});
			this.checkPageBreak(10);
			this.pdf.setFont("helvetica", "bold");
			this.pdf.text(
				`Total facturé: ${total} €`,
				this.margin,
				this.currentY
			);
		}

		this.addFooter();

		// Générer le PDF et le sécuriser
		const pdfBytes = this.pdf.output('arraybuffer');
		const osteopathName = osteopath?.name;
		const securedPdfBytes = await exportSecurity.securePDF(new Uint8Array(pdfBytes), osteopathName);
		
		const fileName = `dossier_${patient.firstName}_${
			patient.lastName
		}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
		
		// Créer un blob sécurisé et le télécharger
		const blob = new Blob([new Uint8Array(securedPdfBytes)], { type: 'application/pdf' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async exportFromHTML(
		element: HTMLElement,
		filename: string
	): Promise<void> {
		const canvas = await html2canvas(element, {
			scale: 2,
			useCORS: true,
			allowTaint: true,
		});
		const imgData = canvas.toDataURL("image/png");
		const pdf = new jsPDF();
		const imgWidth = 210;
		const pageHeight = 295;
		const imgHeight = (canvas.height * imgWidth) / canvas.width;
		let heightLeft = imgHeight;
		let position = 0;

		pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
		heightLeft -= pageHeight;
		while (heightLeft >= 0) {
			position = heightLeft - imgHeight;
			pdf.addPage();
			pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;
		}
		
		// Sécuriser le PDF avant sauvegarde
		const pdfBytes = pdf.output('arraybuffer');
		const securedPdfBytes = await exportSecurity.securePDF(new Uint8Array(pdfBytes));
		
		// Créer un blob sécurisé et le télécharger
		const blob = new Blob([new Uint8Array(securedPdfBytes)], { type: 'application/pdf' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async exportPatient(
		patient: Patient,
		options: ExportOptions = {},
		appointments?: Appointment[],
		invoices?: Invoice[]
	): Promise<void> {
		return this.exportPatientComplete(
			{ patient, appointments, invoices },
			options
		);
	}
}

export const exportPatientToPDF = async (
	patient: Patient,
	appointments?: Appointment[],
	invoices?: Invoice[],
	osteopath?: Osteopath,
	cabinet?: Cabinet
) => {
	const exporter = new PatientPDFExporter();
	await exporter.exportPatientComplete({
		patient,
		appointments,
		invoices,
		osteopath,
		cabinet,
	});
};

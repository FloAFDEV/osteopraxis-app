
import { useState } from "react";
import { Layout } from "@/components/ui/layout";
import { BackButton } from "@/components/ui/back-button";
import { HelpButton } from "@/components/ui/help-button";
import { DataImportUpload } from "@/components/import/DataImportUpload";
import { DataImportPreview } from "@/components/import/DataImportPreview";
import { DataImportMapping } from "@/components/import/DataImportMapping";
import { DataImportProgress } from "@/components/import/DataImportProgress";
import { DataImportReport } from "@/components/import/DataImportReport";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ImportStep, ImportData, ImportResult } from "@/types/import";

const DataImportPage = () => {
	const [currentStep, setCurrentStep] = useState<ImportStep>("upload");
	const [importData, setImportData] = useState<ImportData | null>(null);
	const [importResult, setImportResult] = useState<ImportResult | null>(null);

	const steps = [
		{ id: "upload", label: "Upload", icon: Upload },
		{ id: "preview", label: "Prévisualisation", icon: FileSpreadsheet },
		{ id: "mapping", label: "Correspondances", icon: CheckCircle },
		{ id: "import", label: "Import", icon: CheckCircle },
		{ id: "report", label: "Rapport", icon: CheckCircle },
	] as const;

	const handleFileUploaded = (data: ImportData) => {
		setImportData(data);
		setCurrentStep("preview");
	};

	const handlePreviewConfirmed = () => {
		setCurrentStep("mapping");
	};

	const handleMappingConfirmed = () => {
		setCurrentStep("import");
	};

	const handleImportCompleted = (result: ImportResult) => {
		setImportResult(result);
		setCurrentStep("report");
	};

	const handleStartOver = () => {
		setCurrentStep("upload");
		setImportData(null);
		setImportResult(null);
	};

	const downloadTemplate = async () => {
		try {
			// Créer un fichier Excel template avec les champs réels de la table Patient
			const ExcelJS = await import('exceljs');
			const workbook = new ExcelJS.Workbook();
			const worksheet = workbook.addWorksheet("Patients");

			// Headers - champs essentiels du formulaire patient
			const headers = [
				'firstName', 'lastName', 'email', 'phone', 'birthDate', 
				'address', 'allergies', 'surgicalHistory', 'traumaHistory', 
				'currentTreatment', 'physicalActivity', 'notes'
			];

			// Exemples de données 
			const exampleData = [
				['Jean', 'Dupont', 'jean.dupont@email.com', '0123456789', '1980-01-15',
				'123 Rue de la Paix, 75001 Paris', 'Aucune', 'Appendicectomie 2015', 'Chute vélo 2018', 
				'Aucun', 'Course à pied 2x/semaine', 'Patient régulier'],
				['Marie', 'Martin', 'marie.martin@email.com', '0987654321', '1990-05-20',
				'456 Avenue des Champs, 69000 Lyon', 'Aspirine', 'Aucune', 'Entorse cheville',
				'Doliprane si besoin', 'Yoga, natation', 'Migraines fréquentes']
			];

			// Ajouter les headers
			worksheet.addRow(headers);
			// Ajouter les données d'exemple
			exampleData.forEach(row => worksheet.addRow(row));

			// Ajuster la largeur des colonnes
			const colWidths = [15, 15, 25, 15, 12, 35, 20, 25, 25, 25, 20, 30];
			worksheet.columns.forEach((column, index) => {
				if (column) {
					column.width = colWidths[index] || 15;
				}
			});

			// Styliser les headers
			const headerRow = worksheet.getRow(1);
			headerRow.font = { bold: true };
			headerRow.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FFE6F3FF' }
			};

			// Télécharger le fichier
			const buffer = await workbook.xlsx.writeBuffer();
			const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			});
			
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = "modele-import-patients.xlsx";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Erreur lors de la création du template:', error);
		}
	};

	return (
		<Layout>
			<div className="max-w-6xl mx-auto space-y-8">
				<BackButton to="/settings" />
				
				<div className="mb-6">
					<div className="flex items-center gap-4">
						<Upload className="h-8 w-8 text-primary" />
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<h1 className="text-3xl font-bold">
									Import de données
								</h1>
								<HelpButton 
									content="Importez vos patients depuis des fichiers Excel ou CSV. Le système détecte automatiquement les colonnes et vous permet de faire correspondre les champs avec votre base de données OstéoPraxis. Compatible avec la plupart des logiciels médicaux."
								/>
							</div>
							<p className="text-muted-foreground mt-1">
								Importez vos patients depuis Excel, CSV ou autres logiciels
							</p>
						</div>
					</div>
				</div>

				{/* Progress Steps */}
				<div className="flex items-center justify-between mb-8">
					{steps.map((step, index) => {
						const StepIcon = step.icon;
						const isActive = step.id === currentStep;
						const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
						
						return (
							<div key={step.id} className="flex items-center">
								<div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
									isActive 
										? "bg-primary text-primary-foreground" 
										: isCompleted 
											? "bg-primary/20 text-primary" 
											: "bg-muted text-muted-foreground"
								}`}>
									<StepIcon className="h-4 w-4" />
									<span className="text-sm font-medium">{step.label}</span>
								</div>
								{index < steps.length - 1 && (
									<div className={`w-8 h-0.5 mx-2 ${
										isCompleted ? "bg-primary" : "bg-muted"
									}`} />
								)}
							</div>
						);
					})}
				</div>

				{/* Template Download */}
				{currentStep === "upload" && (
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileSpreadsheet className="h-5 w-5 text-blue-500" />
								Modèle Excel recommandé
							</CardTitle>
							<CardDescription>
								Téléchargez notre modèle pour faciliter l'import de vos données
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Badge variant="secondary">Excel .xlsx</Badge>
									<span className="text-sm text-muted-foreground">
										Colonnes pré-configurées pour OstéoPraxis
									</span>
								</div>
								<Button onClick={downloadTemplate} variant="outline" size="sm">
									Télécharger le modèle
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Step Components */}
				{currentStep === "upload" && (
					<DataImportUpload onFileUploaded={handleFileUploaded} />
				)}

				{currentStep === "preview" && importData && (
					<DataImportPreview 
						data={importData} 
						onConfirm={handlePreviewConfirmed}
						onBack={() => setCurrentStep("upload")}
					/>
				)}

				{currentStep === "mapping" && importData && (
					<DataImportMapping 
						data={importData}
						onConfirm={handleMappingConfirmed}
						onBack={() => setCurrentStep("preview")}
					/>
				)}

				{currentStep === "import" && importData && (
					<DataImportProgress 
						data={importData}
						onCompleted={handleImportCompleted}
					/>
				)}

				{currentStep === "report" && importResult && (
					<DataImportReport 
						result={importResult}
						onStartOver={handleStartOver}
					/>
				)}
			</div>
		</Layout>
	);
};

export default DataImportPage;

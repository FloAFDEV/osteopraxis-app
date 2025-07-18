
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Users, Clock } from "lucide-react";
import { importPatients } from "@/services/import/patient-importer";
import type { ImportData, ImportResult, ImportMapping } from "@/types/import";

interface DataImportProgressProps {
	data: ImportData;
	mapping?: ImportMapping;
	onCompleted: (result: ImportResult) => void;
}

export const DataImportProgress = ({ data, mapping, onCompleted }: DataImportProgressProps) => {
	const [progress, setProgress] = useState(0);
	const [currentStatus, setCurrentStatus] = useState("Initialisation...");
	const [processedCount, setProcessedCount] = useState(0);
	const [startTime] = useState(Date.now());

	useEffect(() => {
		const runImport = async () => {
			try {
				setCurrentStatus("Validation des données...");
				setProgress(10);

				// Simuler un petit délai pour l'UX
				await new Promise(resolve => setTimeout(resolve, 500));

				setCurrentStatus("Import en cours...");
				setProgress(20);

				const result = await importPatients(data, mapping, {
					onProgress: (processed, total) => {
						setProcessedCount(processed);
						setProgress(20 + (processed / total) * 70);
						setCurrentStatus(`Import en cours... ${processed}/${total} patients traités`);
					}
				});

				setCurrentStatus("Finalisation...");
				setProgress(95);

				await new Promise(resolve => setTimeout(resolve, 500));

				setProgress(100);
				setCurrentStatus("Import terminé !");

				const duration = Date.now() - startTime;
				onCompleted({
					...result,
					duration
				});

			} catch (error) {
				console.error("Erreur durant l'import:", error);
				setCurrentStatus("Erreur durant l'import");
				
				// En cas d'erreur, créer un résultat d'échec
				onCompleted({
					totalProcessed: processedCount,
					successful: 0,
					failed: processedCount,
					duplicates: 0,
					errors: [{
						row: 0,
						column: "general",
						value: "",
						error: error instanceof Error ? error.message : "Erreur inconnue"
					}],
					duration: Date.now() - startTime
				});
			}
		};

		runImport();
	}, [data, mapping, onCompleted, processedCount, startTime]);

	const formatDuration = (ms: number) => {
		const seconds = Math.floor(ms / 1000);
		if (seconds < 60) return `${seconds}s`;
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5 text-primary" />
						Import en cours
					</CardTitle>
					<CardDescription>
						Importation de vos patients dans PatientHub
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Barre de progression principale */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="font-medium">{currentStatus}</span>
							<span className="text-muted-foreground">{Math.round(progress)}%</span>
						</div>
						<Progress value={progress} className="h-2" />
					</div>

					{/* Statistiques en temps réel */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center p-3 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold text-blue-600">{data.totalRows}</div>
							<div className="text-xs text-muted-foreground">Total à traiter</div>
						</div>
						
						<div className="text-center p-3 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold text-green-600">{processedCount}</div>
							<div className="text-xs text-muted-foreground">Traités</div>
						</div>
						
						<div className="text-center p-3 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold text-orange-600">
								{Math.max(0, data.totalRows - processedCount)}
							</div>
							<div className="text-xs text-muted-foreground">Restants</div>
						</div>
						
						<div className="text-center p-3 bg-muted/50 rounded-lg">
							<div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
								<Clock className="h-4 w-4" />
								{formatDuration(Date.now() - startTime)}
							</div>
							<div className="text-xs text-muted-foreground">Durée</div>
						</div>
					</div>

					{/* Étapes de traitement */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm">
							<CheckCircle className="h-4 w-4 text-green-500" />
							<span>Fichier analysé</span>
						</div>
						
						<div className="flex items-center gap-2 text-sm">
							<CheckCircle className="h-4 w-4 text-green-500" />
							<span>Correspondances validées</span>
						</div>
						
						<div className="flex items-center gap-2 text-sm">
							{progress >= 20 ? (
								<CheckCircle className="h-4 w-4 text-green-500" />
							) : (
								<div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
							)}
							<span>Import des patients</span>
						</div>
						
						<div className="flex items-center gap-2 text-sm">
							{progress >= 100 ? (
								<CheckCircle className="h-4 w-4 text-green-500" />
							) : (
								<div className="h-4 w-4 border-2 border-muted-foreground/30 rounded-full" />
							)}
							<span>Génération du rapport</span>
						</div>
					</div>

					{/* Message d'information */}
					<div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
						<div className="flex items-start gap-2">
							<AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
							<div className="text-sm text-blue-800 dark:text-blue-200">
								<p className="font-medium mb-1">Import en cours</p>
								<p>
									Veuillez ne pas fermer cette page pendant l'import. 
									Un rapport détaillé sera généré à la fin du processus.
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

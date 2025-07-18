
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, AlertTriangle, Clock, Download, RotateCcw } from "lucide-react";
import type { ImportResult } from "@/types/import";

interface DataImportReportProps {
	result: ImportResult;
	onStartOver: () => void;
}

export const DataImportReport = ({ result, onStartOver }: DataImportReportProps) => {
	const successRate = Math.round((result.successful / result.totalProcessed) * 100);
	
	const formatDuration = (ms: number) => {
		const seconds = Math.floor(ms / 1000);
		if (seconds < 60) return `${seconds}s`;
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	};

	const downloadErrorReport = () => {
		if (result.errors.length === 0) return;

		const csvContent = [
			"Ligne,Colonne,Valeur,Erreur",
			...result.errors.map(error => 
				`${error.row},"${error.column}","${error.value}","${error.error}"`
			)
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `rapport-erreurs-import-${new Date().toISOString().split('T')[0]}.csv`;
		link.click();
	};

	return (
		<div className="space-y-6">
			{/* Résumé principal */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						{result.failed === 0 ? (
							<CheckCircle className="h-6 w-6 text-green-500" />
						) : result.successful === 0 ? (
							<XCircle className="h-6 w-6 text-red-500" />
						) : (
							<AlertTriangle className="h-6 w-6 text-yellow-500" />
						)}
						Import terminé
					</CardTitle>
					<CardDescription>
						Rapport détaillé de l'importation de vos données
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Statistiques principales */}
					<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
						<div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
							<div className="text-3xl font-bold text-blue-600">{result.totalProcessed}</div>
							<div className="text-sm text-blue-800 dark:text-blue-200">Total traité</div>
						</div>
						
						<div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
							<div className="text-3xl font-bold text-green-600">{result.successful}</div>
							<div className="text-sm text-green-800 dark:text-green-200">Réussis</div>
						</div>
						
						<div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
							<div className="text-3xl font-bold text-red-600">{result.failed}</div>
							<div className="text-sm text-red-800 dark:text-red-200">Échoués</div>
						</div>
						
						<div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
							<div className="text-3xl font-bold text-orange-600">{result.duplicates}</div>
							<div className="text-sm text-orange-800 dark:text-orange-200">Doublons</div>
						</div>
						
						<div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
							<div className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-1">
								<Clock className="h-5 w-5" />
								{formatDuration(result.duration)}
							</div>
							<div className="text-sm text-purple-800 dark:text-purple-200">Durée</div>
						</div>
					</div>

					{/* Taux de réussite */}
					<div className="text-center">
						<div className="inline-flex items-center gap-2">
							<span className="text-lg">Taux de réussite :</span>
							<Badge 
								variant={successRate >= 90 ? "default" : successRate >= 70 ? "secondary" : "destructive"}
								className="text-lg px-3 py-1"
							>
								{successRate}%
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Messages de statut */}
			{result.successful > 0 && (
				<Alert>
					<CheckCircle className="h-4 w-4" />
					<AlertDescription>
						<strong>{result.successful} patients</strong> ont été importés avec succès dans votre base de données.
					</AlertDescription>
				</Alert>
			)}

			{result.duplicates > 0 && (
				<Alert>
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						<strong>{result.duplicates} doublons</strong> ont été détectés et ignorés 
						(patients déjà existants avec le même nom et prénom).
					</AlertDescription>
				</Alert>
			)}

			{/* Erreurs détaillées */}
			{result.errors.length > 0 && (
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="text-red-600">
								Erreurs détectées ({result.errors.length})
							</CardTitle>
							<CardDescription>
								Liste des erreurs rencontrées durant l'import
							</CardDescription>
						</div>
						<Button 
							variant="outline" 
							size="sm"
							onClick={downloadErrorReport}
						>
							<Download className="h-4 w-4 mr-2" />
							Télécharger
						</Button>
					</CardHeader>
					<CardContent>
						<div className="max-h-60 overflow-y-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Ligne</TableHead>
										<TableHead>Colonne</TableHead>
										<TableHead>Valeur</TableHead>
										<TableHead>Erreur</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{result.errors.slice(0, 20).map((error, index) => (
										<TableRow key={index}>
											<TableCell className="font-mono">{error.row}</TableCell>
											<TableCell>{error.column}</TableCell>
											<TableCell className="max-w-[150px] truncate">
												{error.value || "-"}
											</TableCell>
											<TableCell className="text-red-600 text-sm">
												{error.error}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							{result.errors.length > 20 && (
								<p className="text-center text-sm text-muted-foreground mt-2">
									Affichage des 20 premières erreurs sur {result.errors.length} au total
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Actions */}
			<div className="flex justify-center gap-4">
				<Button onClick={onStartOver} variant="outline">
					<RotateCcw className="h-4 w-4 mr-2" />
					Nouvel import
				</Button>
				
				<Button onClick={() => window.location.href = "/patients"}>
					Voir mes patients
				</Button>
			</div>
		</div>
	);
};

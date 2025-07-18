
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseExcelFile, parseCSVFile } from "@/services/import/file-parser";
import type { ImportData } from "@/types/import";

interface DataImportUploadProps {
	onFileUploaded: (data: ImportData) => void;
}

export const DataImportUpload = ({ onFileUploaded }: DataImportUploadProps) => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (!file) return;

		setIsProcessing(true);
		setError(null);

		try {
			let importData: ImportData;

			if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
				importData = await parseExcelFile(file);
			} else if (file.name.endsWith('.csv')) {
				importData = await parseCSVFile(file);
			} else {
				throw new Error("Format de fichier non supporté");
			}

			onFileUploaded(importData);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erreur lors du traitement du fichier");
		} finally {
			setIsProcessing(false);
		}
	}, [onFileUploaded]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
			'application/vnd.ms-excel': ['.xls'],
			'text/csv': ['.csv']
		},
		maxFiles: 1,
		disabled: isProcessing
	});

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Upload className="h-5 w-5 text-primary" />
						Sélectionner un fichier
					</CardTitle>
					<CardDescription>
						Glissez-déposez votre fichier Excel ou CSV, ou cliquez pour sélectionner
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div
						{...getRootProps()}
						className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
							isDragActive 
								? "border-primary bg-primary/5" 
								: "border-muted-foreground/25 hover:border-primary/50"
						} ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
					>
						<input {...getInputProps()} />
						
						{isProcessing ? (
							<div className="space-y-4">
								<div className="animate-spin mx-auto h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
								<p className="text-sm text-muted-foreground">
									Traitement du fichier en cours...
								</p>
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex justify-center gap-4">
									<FileSpreadsheet className="h-12 w-12 text-green-500" />
									<FileText className="h-12 w-12 text-blue-500" />
								</div>
								
								{isDragActive ? (
									<p className="text-lg font-medium text-primary">
										Déposez le fichier ici...
									</p>
								) : (
									<div className="space-y-2">
										<p className="text-lg font-medium">
											Glissez-déposez votre fichier ici
										</p>
										<p className="text-sm text-muted-foreground">
											ou cliquez pour sélectionner
										</p>
									</div>
								)}
								
								<div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
									<span className="bg-green-100 text-green-800 px-2 py-1 rounded">
										Excel (.xlsx, .xls)
									</span>
									<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
										CSV (.csv)
									</span>
								</div>
							</div>
						)}
					</div>

					{error && (
						<Alert variant="destructive" className="mt-4">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>

			{/* Informations sur les formats supportés */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Formats supportés</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid md:grid-cols-2 gap-4">
						<div className="flex items-start gap-3">
							<FileSpreadsheet className="h-5 w-5 text-green-500 mt-0.5" />
							<div>
								<h4 className="font-medium">Fichiers Excel</h4>
								<p className="text-sm text-muted-foreground">
									Formats .xlsx et .xls supportés. Première ligne utilisée comme en-têtes.
								</p>
							</div>
						</div>
						
						<div className="flex items-start gap-3">
							<FileText className="h-5 w-5 text-blue-500 mt-0.5" />
							<div>
								<h4 className="font-medium">Fichiers CSV</h4>
								<p className="text-sm text-muted-foreground">
									Séparateurs : virgule, point-virgule. Encodage UTF-8 recommandé.
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

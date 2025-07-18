
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, ArrowLeft, ArrowRight, FileSpreadsheet } from "lucide-react";
import type { ImportData } from "@/types/import";

interface DataImportPreviewProps {
	data: ImportData;
	onConfirm: () => void;
	onBack: () => void;
}

export const DataImportPreview = ({ data, onConfirm, onBack }: DataImportPreviewProps) => {
	const previewRows = data.rows.slice(0, 10); // Afficher les 10 premières lignes

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Eye className="h-5 w-5 text-primary" />
						Prévisualisation des données
					</CardTitle>
					<CardDescription>
						Vérifiez que vos données sont correctement détectées avant de continuer
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Informations sur le fichier */}
					<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
						<FileSpreadsheet className="h-6 w-6 text-primary" />
						<div>
							<h4 className="font-medium">{data.fileName}</h4>
							<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
								<Badge variant="secondary" className="text-xs">
									{data.fileType.toUpperCase()}
								</Badge>
								<span>{data.totalRows} lignes</span>
								<span>•</span>
								<span>{data.headers.length} colonnes</span>
							</div>
						</div>
					</div>

					{/* Tableau de prévisualisation */}
					<div className="border rounded-lg overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">#</TableHead>
									{data.headers.map((header, index) => (
										<TableHead key={index} className="min-w-[120px]">
											{header || `Colonne ${index + 1}`}
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{previewRows.map((row, rowIndex) => (
									<TableRow key={rowIndex}>
										<TableCell className="font-mono text-xs text-muted-foreground">
											{rowIndex + 1}
										</TableCell>
										{row.map((cell, cellIndex) => (
											<TableCell key={cellIndex} className="max-w-[200px] truncate">
												{cell || "-"}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{data.totalRows > 10 && (
						<p className="text-sm text-muted-foreground text-center">
							Affichage des 10 premières lignes sur {data.totalRows} au total
						</p>
					)}
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="flex justify-between">
				<Button variant="outline" onClick={onBack}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Retour
				</Button>
				
				<Button onClick={onConfirm}>
					Continuer
					<ArrowRight className="h-4 w-4 ml-2" />
				</Button>
			</div>
		</div>
	);
};

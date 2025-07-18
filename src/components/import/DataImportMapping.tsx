
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Link2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PATIENT_FIELDS, type ImportData, type ImportMapping, type PatientFieldKey } from "@/types/import";

interface DataImportMappingProps {
	data: ImportData;
	onConfirm: (mapping: ImportMapping) => void;
	onBack: () => void;
}

export const DataImportMapping = ({ data, onConfirm, onBack }: DataImportMappingProps) => {
	const [mapping, setMapping] = useState<ImportMapping>(() => {
		// Auto-mapping intelligent basé sur les noms de colonnes
		const initialMapping: ImportMapping = {};
		
		data.headers.forEach(header => {
			const lowerHeader = header.toLowerCase().trim();
			let targetField: PatientFieldKey | null = null;

			// Mapping automatique basé sur des mots-clés
			if (lowerHeader.includes('prénom') || lowerHeader.includes('prenom') || lowerHeader === 'firstname') {
				targetField = 'firstName';
			} else if (lowerHeader.includes('nom') || lowerHeader === 'lastname') {
				targetField = 'lastName';
			} else if (lowerHeader.includes('email') || lowerHeader.includes('mail')) {
				targetField = 'email';
			} else if (lowerHeader.includes('téléphone') || lowerHeader.includes('telephone') || lowerHeader.includes('phone') || lowerHeader.includes('tel')) {
				targetField = 'phone';
			} else if (lowerHeader.includes('naissance') || lowerHeader.includes('birth')) {
				targetField = 'birthDate';
			} else if (lowerHeader.includes('genre') || lowerHeader.includes('sexe') || lowerHeader.includes('gender')) {
				targetField = 'gender';
			} else if (lowerHeader.includes('adresse') || lowerHeader.includes('address')) {
				targetField = 'address';
			} else if (lowerHeader.includes('ville') || lowerHeader.includes('city')) {
				targetField = 'city';
			} else if (lowerHeader.includes('postal') || lowerHeader.includes('zip')) {
				targetField = 'postalCode';
			} else if (lowerHeader.includes('profession') || lowerHeader.includes('métier') || lowerHeader.includes('job')) {
				targetField = 'occupation';
			} else if (lowerHeader.includes('allergie')) {
				targetField = 'allergies';
			} else if (lowerHeader.includes('traitement') || lowerHeader.includes('treatment')) {
				targetField = 'currentTreatment';
			} else if (lowerHeader.includes('note')) {
				targetField = 'notes';
			} else if (lowerHeader.includes('taille') || lowerHeader.includes('height')) {
				targetField = 'height';
			} else if (lowerHeader.includes('poids') || lowerHeader.includes('weight')) {
				targetField = 'weight';
			}

			initialMapping[header] = {
				sourceColumn: header,
				targetField,
				isRequired: targetField ? PATIENT_FIELDS[targetField].required : false,
				dataType: targetField ? PATIENT_FIELDS[targetField].type : 'text'
			};
		});

		return initialMapping;
	});

	const handleMappingChange = (sourceColumn: string, targetField: string | null) => {
		setMapping(prev => ({
			...prev,
			[sourceColumn]: {
				...prev[sourceColumn],
				targetField: targetField as PatientFieldKey | null,
				isRequired: targetField ? PATIENT_FIELDS[targetField as PatientFieldKey].required : false,
				dataType: targetField ? PATIENT_FIELDS[targetField as PatientFieldKey].type : 'text'
			}
		}));
	};

	const getUsedFields = () => {
		return Object.values(mapping)
			.map(m => m.targetField)
			.filter(Boolean) as PatientFieldKey[];
	};

	const getAvailableFields = (currentField: string | null) => {
		const usedFields = getUsedFields();
		return Object.entries(PATIENT_FIELDS).filter(([key]) => 
			key === currentField || !usedFields.includes(key as PatientFieldKey)
		);
	};

	const getMissingRequiredFields = () => {
		const mappedFields = getUsedFields();
		return Object.entries(PATIENT_FIELDS)
			.filter(([key, field]) => field.required && !mappedFields.includes(key as PatientFieldKey))
			.map(([key]) => key);
	};

	const canProceed = getMissingRequiredFields().length === 0;

	const handleConfirm = () => {
		if (canProceed) {
			onConfirm(mapping);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Link2 className="h-5 w-5 text-primary" />
						Correspondance des colonnes
					</CardTitle>
					<CardDescription>
						Faites correspondre les colonnes de votre fichier avec les champs PatientHub
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{!canProceed && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Les champs obligatoires suivants doivent être mappés : {" "}
								{getMissingRequiredFields().map(field => 
									PATIENT_FIELDS[field as PatientFieldKey].label
								).join(", ")}
							</AlertDescription>
						</Alert>
					)}

					<div className="space-y-3">
						{data.headers.map((header, index) => {
							const currentMapping = mapping[header];
							const availableFields = getAvailableFields(currentMapping.targetField);
							
							return (
								<div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
									<div className="flex-1">
										<div className="font-medium text-sm">{header}</div>
										<div className="text-xs text-muted-foreground">
											Exemple: {data.rows[0]?.[index] || "Pas de données"}
										</div>
									</div>
									
									<ArrowRight className="h-4 w-4 text-muted-foreground" />
									
									<div className="flex-1">
										<Select
											value={currentMapping.targetField || ""}
											onValueChange={(value) => 
												handleMappingChange(header, value || null)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionner un champ" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="">
													Ne pas importer
												</SelectItem>
												{availableFields.map(([key, field]) => (
													<SelectItem key={key} value={key}>
														<div className="flex items-center gap-2">
															{field.label}
															{field.required && (
																<Badge variant="destructive" className="text-xs">
																	Obligatoire
																</Badge>
															)}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							);
						})}
					</div>

					{/* Résumé du mapping */}
					<div className="p-4 bg-muted/50 rounded-lg">
						<h4 className="font-medium mb-2">Résumé</h4>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-muted-foreground">Colonnes mappées :</span>
								<span className="ml-2 font-medium">
									{Object.values(mapping).filter(m => m.targetField).length} / {data.headers.length}
								</span>
							</div>
							<div>
								<span className="text-muted-foreground">Champs obligatoires :</span>
								<span className="ml-2 font-medium">
									{Object.entries(PATIENT_FIELDS).filter(([, field]) => field.required).length - getMissingRequiredFields().length} / {Object.entries(PATIENT_FIELDS).filter(([, field]) => field.required).length}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="flex justify-between">
				<Button variant="outline" onClick={onBack}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Retour
				</Button>
				
				<Button onClick={handleConfirm} disabled={!canProceed}>
					Démarrer l'import
					<ArrowRight className="h-4 w-4 ml-2" />
				</Button>
			</div>
		</div>
	);
};

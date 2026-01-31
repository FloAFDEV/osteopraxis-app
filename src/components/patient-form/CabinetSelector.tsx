import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building, Info, Plus, ArrowRight, Presentation, MapPin, Lock } from "lucide-react";
import { isDemoSession } from "@/utils/demo-detection";
import { Cabinet } from "@/types";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
} from "@/components/ui/form";
import { TranslatedSelect } from "@/components/ui/translated-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";
import { useCabinets } from "@/hooks/useCabinets";

interface CabinetSelectorProps {
	form: UseFormReturn<PatientFormValues>;
	selectedCabinetId: string | null;
	onCabinetChange: (cabinetId: string) => void;
}

export const CabinetSelector = ({
	form,
	selectedCabinetId,
	onCabinetChange,
}: CabinetSelectorProps) => {
	const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null); // null = en cours de détection
	const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(
		null,
	);

	// 🎯 ÉTAPE 1 : Détecter le mode démo en PREMIER
	useEffect(() => {
		const checkDemoMode = async () => {
			const demo = await isDemoSession();
			setIsDemoMode(demo);

			if (demo) {
				console.log(
					"🧹 [CabinetSelector] Mode démo : invalidation du cache cabinets",
				);
				const { cabinetCache } =
					await import("@/services/cache/cabinet-cache");
				cabinetCache.invalidate();
			}
		};
		checkDemoMode();
	}, []);

	// 🎯 ÉTAPE 2 : Charger les cabinets UNIQUEMENT après détection
	const { data: cabinets = [], isLoading: loading } = useCabinets();

	// 🎯 ÉTAPE 3 : Afficher un loader pendant la détection
	if (isDemoMode === null) {
		return (
			<div className="flex items-center justify-center p-4">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
				<span className="ml-2 text-sm text-muted-foreground">
					Détection du mode...
				</span>
			</div>
		);
	}

	useEffect(() => {
		if (isDemoMode && cabinets.length > 0) {
			// 🎭 MODE DÉMO: Forcer la sélection du cabinet démo (ID=1)
			const demoCabinet = cabinets.find((c) => c.id === 1);
			if (demoCabinet) {
				setSelectedCabinet(demoCabinet);
				onCabinetChange("1");
				form.setValue("cabinetId", 1);
			}
			return; // Sortir tôt en mode démo
		}

		// Mode connecté : logique normale
		if (cabinets.length > 0) {
			if (!selectedCabinetId) {
				const firstCabinet = cabinets[0];
				setSelectedCabinet(firstCabinet);
				onCabinetChange(firstCabinet.id.toString());
				form.setValue("cabinetId", firstCabinet.id);
			} else {
				const cabinet = cabinets.find(
					(c) => c.id === parseInt(selectedCabinetId),
				);
				setSelectedCabinet(cabinet || null);
			}
		}
	}, [cabinets, selectedCabinetId, isDemoMode, onCabinetChange, form]);

	const handleCabinetChange = (value: string) => {
		const cabinet = cabinets.find((c) => c.id === parseInt(value));
		setSelectedCabinet(cabinet || null);
		onCabinetChange(value);
		form.setValue("cabinetId", parseInt(value));
	};

	return (
		<div className="space-y-4">
			<FormField
				control={form.control}
				name="cabinetId"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="flex items-center gap-2">
							<Building className="h-4 w-4" />
							Cabinet de rattachement
							<span className="text-red-500">*</span>
						</FormLabel>
						<FormDescription>
							Sélectionnez le cabinet auquel ce patient sera
							rattaché
						</FormDescription>
						<FormControl>
							<TranslatedSelect
								value={selectedCabinetId}
								onValueChange={handleCabinetChange}
								enumType="Cabinet"
								placeholder={
									loading
										? "Chargement..."
										: "Sélectionner un cabinet"
								}
								disabled={loading || isDemoMode}
							/>
						</FormControl>
					</FormItem>
				)}
			/>

			{selectedCabinet && (
				<Alert
					className={
						isDemoMode
							? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
							: ""
					}
				>
					{isDemoMode ? (
						<Presentation className="h-4 w-4 text-blue-600" />
					) : (
						<Info className="h-4 w-4" />
					)}
					<AlertDescription>
						<div className="flex items-center gap-2 mb-1">
							<strong>Cabinet sélectionné :</strong>{" "}
							{selectedCabinet.name}
							{isDemoMode && (
								<span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
									MODE DÉMO
								</span>
							)}
						</div>
						{selectedCabinet.address && (
							<span className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
								<MapPin className="h-3 w-3" /> {selectedCabinet.address}
							</span>
						)}
						{isDemoMode && (
							<p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium flex items-center gap-1">
								<Lock className="h-3 w-3" /> Cabinet fixe en mode démo (non modifiable)
							</p>
						)}
					</AlertDescription>
				</Alert>
			)}

			{cabinets.length === 0 && !loading && (
				<Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
					<Plus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
					<AlertDescription className="flex items-center justify-between">
						<div>
							<strong className="text-orange-800 dark:text-orange-200">
								Aucun cabinet configuré
							</strong>
							<p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
								Vous devez d'abord créer un cabinet pour pouvoir
								ajouter des patients.
							</p>
						</div>
						<Button
							asChild
							variant="outline"
							className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900"
						>
							<Link
								to="/cabinets/new"
								className="flex items-center gap-2"
							>
								<Plus className="h-4 w-4" />
								Créer un cabinet
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
};

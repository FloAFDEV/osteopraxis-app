import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CabinetFormValues } from "./types";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreditCard, FileText, Hash } from "lucide-react";

interface BillingInfoFieldsProps {
	form: UseFormReturn<CabinetFormValues>;
	isSubmitting: boolean;
}

export function BillingInfoFields({
	form,
	isSubmitting,
}: BillingInfoFieldsProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center space-x-2 mb-4">
				<CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
				<h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
					Informations de facturation
				</h3>
			</div>

			<div className="grid grid-cols-1 gap-4">
				<FormField
					control={form.control}
					name="siret"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center space-x-2">
								<Hash className="h-4 w-4" />
								<span>Numéro SIRET</span>
							</FormLabel>
							<FormControl>
								<Input
									placeholder="Numéro SIRET"
									disabled={isSubmitting}
									className="h-11"
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormDescription className="text-sm">
								Numéro SIRET nécessaire pour la facturation
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="rppsNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center space-x-2">
								<FileText className="h-4 w-4" />
								<span>Numéro RPPS</span>
							</FormLabel>
							<FormControl>
								<Input
									placeholder="Numéro RPPS"
									disabled={isSubmitting}
									className="h-11"
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormDescription className="text-sm">
								Numéro RPPS (Répertoire Partagé des
								Professionnels de Santé)
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="apeCode"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center space-x-2">
								<Hash className="h-4 w-4" />
								<span>Code APE</span>
							</FormLabel>
							<FormControl>
								<Input
									placeholder="Code APE (par défaut: 8690F)"
									disabled={isSubmitting}
									className="h-11"
									{...field}
									value={field.value || "8690F"}
								/>
							</FormControl>
							<FormDescription className="text-sm">
								Code APE/NAF de votre activité (par défaut:
								8690F)
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}

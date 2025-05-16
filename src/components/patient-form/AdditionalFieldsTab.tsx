import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "../patient-form";

interface AdditionalFieldsTabProps {
	form: UseFormReturn<PatientFormValues>;
	isChild: boolean;
}

export const AdditionalFieldsTab = ({
	form,
	isChild,
}: AdditionalFieldsTabProps) => {
	const isSmoker = form.watch("isSmoker");
	const isExSmoker = form.watch("isExSmoker");

	return (
		<div className="space-y-6">
			{/* --- Section : Habitudes tabagiques --- */}
			<section>
				<h3 className="font-medium text-lg mb-2">
					Habitudes tabagiques
				</h3>
				<div className="space-y-4">
					<FormField
						control={form.control}
						name="isSmoker"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5">
									<FormLabel className="text-base">
										Fumeur ?
									</FormLabel>
									<FormDescription>
										Indiquez si le patient fume
										actuellement.
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={(checked) => {
											field.onChange(checked);
											if (checked)
												form.setValue(
													"isExSmoker",
													false
												);
										}}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{isSmoker && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
							<FormField
								control={form.control}
								name="smokingSince"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Depuis quand ?</FormLabel>
										<FormControl>
											<Input
												placeholder="Ex: 2010, depuis 5 ans..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="smokingAmount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Quantité</FormLabel>
										<FormControl>
											<Input
												placeholder="Ex: 10 cigarettes/jour"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					)}

					<FormField
						control={form.control}
						name="isExSmoker"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5">
									<FormLabel className="text-base">
										Ex-fumeur ?
									</FormLabel>
									<FormDescription>
										Indiquez si le patient a arrêté de
										fumer.
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={(checked) => {
											field.onChange(checked);
											if (checked)
												form.setValue(
													"isSmoker",
													false
												);
										}}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{isExSmoker && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
							<FormField
								control={form.control}
								name="quitSmokingDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Arrêt depuis</FormLabel>
										<FormControl>
											<Input
												placeholder="Ex: 2018, depuis 3 ans..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="smokingAmount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Quantité avant arrêt
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Ex: 15 cigarettes/jour"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					)}
				</div>
			</section>

			{/* --- Section : Santé générale --- */}
			<section className="space-y-4">
				<FormField
					control={form.control}
					name="ent_followup"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Suivi ORL</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Détails du suivi ORL"
									className="resize-none"
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="intestinal_transit"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Transit intestinal</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Détails sur le transit intestinal"
									className="resize-none"
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="sleep_quality"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Qualité du sommeil</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Détails sur la qualité du sommeil"
									className="resize-none"
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="dental_health"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Santé dentaire</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Détails sur la santé dentaire"
									className="resize-none"
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="sport_frequency"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Fréquence sportive</FormLabel>
							<FormControl>
								<Input
									placeholder="Ex: 3 fois par semaine - course, natation"
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</section>

			{/* --- Section : Antécédents médicaux --- */}
			<section className="space-y-4">
				<FormField
					control={form.control}
					name="fracture_history"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Historique des fractures</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Historique détaillé des fractures"
									className="resize-none"
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{!isChild && (
					<FormField
						control={form.control}
						name="gynecological_history"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Antécédents gynéco-urinaires
								</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Antécédents gynécologiques ou urinaires"
										className="resize-none"
										{...field}
										value={field.value || ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
			</section>

			{/* --- Section : Autres commentaires --- */}
			{!isChild && (
				<section>
					<FormField
						control={form.control}
						name="other_comments_adult"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Autres commentaires (adulte)
								</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Autres informations importantes"
										className="resize-none"
										{...field}
										value={field.value || ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</section>
			)}
		</div>
	);
};

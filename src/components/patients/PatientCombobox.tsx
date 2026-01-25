import * as React from "react";
import {
	Command,
	CommandInput,
	CommandItem,
	CommandList,
	CommandEmpty,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { Patient } from "@/types";
import { PatientBadge } from "./PatientBadge";

interface PatientComboboxProps {
	patients: Patient[];
	value: number | string | null;
	onChange: (id: number | string) => void;
	placeholder?: string;
	className?: string;
}

export function PatientCombobox({
	patients,
	value,
	onChange,
	placeholder = "Choisir le patient",
	className,
}: PatientComboboxProps) {
	const [open, setOpen] = React.useState(false);

	// Trier les patients par nom de famille
	const sortedPatients = React.useMemo(
		() =>
			[...patients].sort((a, b) =>
				a.lastName.localeCompare(b.lastName, "fr", {
					sensitivity: "base",
				}),
			),
		[patients],
	);

	// Patient sélectionné
	const selected = sortedPatients.find((p) => p.id === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className={`w-full justify-between bg-background hover:bg-muted/50 border-input ${className || ""}`}
					aria-expanded={open}
				>
					{selected ? (
						<div className="flex items-center gap-2 flex-1 min-w-0">
							<PatientBadge
								firstName={selected.firstName}
								lastName={selected.lastName}
								gender={selected.gender}
								birthDate={selected.birthDate}
								photoUrl={selected.photoUrl}
								size="sm"
								showGenderBadge={false}
							/>
							<span className="truncate">
								{selected.lastName} {selected.firstName}
								{selected.birthDate && (
									<>
										{" "}
										—{" "}
										{new Date(
											selected.birthDate,
										).toLocaleDateString("fr-FR")}
									</>
								)}
							</span>
						</div>
					) : (
						<span className="truncate">{placeholder}</span>
					)}
					<ChevronDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="p-0 w-[320px]"
				side="bottom"
			>
				<Command>
					<CommandInput placeholder="Recherche par nom ou prénom..." />
					<CommandList>
						<CommandEmpty>Aucun patient trouvé</CommandEmpty>
						{sortedPatients.map((patient) => (
							<CommandItem
								key={patient.id}
								value={`${patient.lastName} ${patient.firstName} ${patient.birthDate ?? ""}`}
								onSelect={() => {
									onChange(patient.id);
									setOpen(false);
								}}
								className="flex items-center gap-2 py-2 cursor-pointer hover:bg-accent/50"
							>
								<PatientBadge
									firstName={patient.firstName}
									lastName={patient.lastName}
									gender={patient.gender}
									birthDate={patient.birthDate}
									photoUrl={patient.photoUrl}
									size="sm"
									showGenderBadge={true}
								/>
								<div className="flex-1 min-w-0">
									<div className="font-medium truncate">
										{patient.lastName} {patient.firstName}
									</div>
									{patient.birthDate && (
										<div className="text-sm text-muted-foreground">
											{new Date(
												patient.birthDate,
											).toLocaleDateString("fr-FR")}
										</div>
									)}
								</div>
							</CommandItem>
						))}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

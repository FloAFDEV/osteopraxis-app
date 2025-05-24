
import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DateInputProps {
	value: Date | undefined;
	onChange: (date: Date | undefined) => void;
	placeholder?: string;
	format?: string; // "dd/MM/yyyy" par défaut
	className?: string;
	disabled?: boolean;
}

export function DateInput({
	value,
	onChange,
	placeholder = "JJ/MM/AAAA",
	format: dateFormat = "dd/MM/yyyy",
	className,
	disabled = false,
}: DateInputProps) {
	const [inputValue, setInputValue] = React.useState(
		value ? format(value, dateFormat, { locale: fr }) : ""
	);
	const [invalid, setInvalid] = React.useState(false);

	React.useEffect(() => {
		setInputValue(value ? format(value, dateFormat, { locale: fr }) : "");
	}, [value, dateFormat]);

	// Helper pour parser et contrôler la validité + bornes d'années (1900 à aujourd'hui)
	const parseOrNull = (str: string) => {
		const d = parse(str, dateFormat, new Date(), { locale: fr });
		if (!isValid(d)) return null;
		// Limiter l'année
		const year = d.getFullYear();
		const thisYear = new Date().getFullYear();
		if (year < 1900 || year > thisYear) return null;
		return d;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let v = e.target.value.replace(/\D/g, ""); // Ne garder que les chiffres

		// Insère des slashs automatiquement
		if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
		if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5);
		if (v.length > 10) v = v.slice(0, 10); // Limite à JJ/MM/AAAA

		setInputValue(v);

		const parsed = parseOrNull(v);
		setInvalid(!parsed && v.length === 10);
		if (parsed) {
			onChange(parsed);
		}
		if (v.trim() === "") {
			onChange(undefined);
			setInvalid(false);
		}
	};

	const handleBlur = () => {
		if (!inputValue) {
			setInvalid(false);
			onChange(undefined);
			return;
		}
		const parsed = parseOrNull(inputValue);
		if (parsed) {
			onChange(parsed);
			setInputValue(format(parsed, dateFormat, { locale: fr }));
			setInvalid(false);
		} else {
			// reset à l'ancienne valeur (valeur Date précédente ou chaîne vide)
			setInputValue(value ? format(value, dateFormat, { locale: fr }) : "");
			setInvalid(true);
		}
	};

	return (
		<div className={cn("relative", className)}>
			<Input
				type="text"
				value={inputValue}
				onChange={handleChange}
				onBlur={handleBlur}
				placeholder={placeholder}
				inputMode="numeric"
				pattern="\d{2}/\d{2}/\d{4}"
				disabled={disabled}
				aria-invalid={invalid}
				title="Format : JJ/MM/AAAA"
				className={cn(invalid && "border-destructive pr-10")}
			/>

			{/* Mini aide si erreur */}
			{invalid && (
				<span className="text-xs text-destructive absolute left-0 -bottom-5">
					Date invalide ou hors bornes (1900–
					{new Date().getFullYear()})
				</span>
			)}
		</div>
	);
}

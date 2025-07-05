import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { fr } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const timeZone = "Europe/Paris";

interface LocationInfo {
	city?: string;
	loading: boolean;
	error?: string;
}

interface FlipDigitProps {
	value: string;
	label: string;
}

const FlipDigit: React.FC<FlipDigitProps> = ({ value, label }) => {
	return (
		<div
			className="relative w-10 h-12 flex items-center justify-center font-mono text-base md:text-lg"
			aria-label={`${label}: ${value}`}
		>
			<AnimatePresence mode="wait">
				<motion.span
					key={value}
					initial={{ rotateX: -90, opacity: 0 }}
					animate={{ rotateX: 0, opacity: 1 }}
					exit={{ rotateX: 90, opacity: 0 }}
					transition={{ duration: 0.25, ease: "easeInOut" }}
					style={{ transformOrigin: "center center" }}
					className="absolute"
				>
					{value}
				</motion.span>
			</AnimatePresence>
		</div>
	);
};

interface TimeSegmentProps {
	hours: string;
	minutes: string;
}

const TimeSegment: React.FC<TimeSegmentProps> = ({ hours, minutes }) => {
	return (
		<div
			role="timer"
			aria-live="polite"
			className="flex items-center gap-1"
		>
			<FlipDigit value={hours} label="heures" />
			<span className="text-muted-foreground text-xl">:</span>
			<FlipDigit value={minutes} label="minutes" />
		</div>
	);
};

const useGeolocation = () => {
	const [location, setLocation] = useState<LocationInfo>({ loading: false });

	const reverseGeocode = useCallback(async (lat: number, lon: number) => {
		const apis = [
			{
				url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fr`,
				parser: (data: any) =>
					data.address?.city ||
					data.address?.town ||
					data.address?.village ||
					data.address?.municipality,
			},
		];

		for (const api of apis) {
			try {
				const response = await fetch(api.url);
				if (!response.ok) continue;
				const data = await response.json();
				const city = api.parser(data);
				if (city) {
					setLocation({ city, loading: false });
					return;
				}
			} catch (error) {
				continue;
			}
		}

		setLocation({ city: "Heure de Paris", loading: false });
	}, []);

	useEffect(() => {
		if (!navigator.geolocation) {
			setLocation({
				loading: false,
				error: "Géolocalisation non supportée",
			});
			return;
		}

		setLocation({ loading: true });

		navigator.geolocation.getCurrentPosition(
			(position) => {
				reverseGeocode(
					position.coords.latitude,
					position.coords.longitude
				);
			},
			() => {
				setLocation({ city: "Heure de Paris", loading: false });
			},
			{
				enableHighAccuracy: false,
				timeout: 8000,
				maximumAge: 300000,
			}
		);
	}, [reverseGeocode]);

	return location;
};

export function AdvancedDateTimeDisplay() {
	const [now, setNow] = useState<Date>(() =>
		toZonedTime(new Date(), timeZone)
	);
	const location = useGeolocation();

	useEffect(() => {
		const update = () => setNow(toZonedTime(new Date(), timeZone));
		update(); // mise à jour immédiate
		const interval = setInterval(update, 60_000); // toutes les minutes
		return () => clearInterval(interval);
	}, []);

	const dateDisplay = useMemo(
		() => format(now, "PPPP", { locale: fr }),
		[now]
	);

	const timeComponents = useMemo(() => {
		const [hours, minutes] = format(now, "HH:mm", { locale: fr }).split(
			":"
		);
		return { hours, minutes };
	}, [now]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="hidden md:flex flex-col items-center gap-2 p-4 rounded-lg bg-card border shadow-sm select-none"
			role="banner"
			aria-label="Affichage de la date et heure actuelles"
		>
			{/* Date complète */}
			<div className="text-base md:text-lg font-medium text-muted-foreground text-center">
				{dateDisplay} à
			</div>

			{/* Heure avec animation flip */}
			<TimeSegment {...timeComponents} />

			{/* Badge de localisation */}
			{location.loading ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground"
				>
					<MapPin className="h-3 w-3 animate-pulse" />
					<span>Localisation...</span>
				</motion.div>
			) : (
				<motion.div
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
				>
					<MapPin className="h-3 w-3" />
					<span>{location.city}</span>
				</motion.div>
			)}
		</motion.div>
	);
}

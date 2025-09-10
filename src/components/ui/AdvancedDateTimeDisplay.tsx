import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock } from "lucide-react";

const timeZone = "Europe/Paris";

interface LocationInfo {
	city?: string;
	loading: boolean;
	error?: string;
	geolocationEnabled: boolean;
}

interface FlipDigitProps {
	value: string;
	label: string;
}

const FlipDigit: React.FC<FlipDigitProps> = ({ value, label }) => {
	return (
		<div
			className="relative inline-block"
			aria-label={`${label}: ${value}`}
		>
			<AnimatePresence mode="wait">
				<motion.span
					key={value}
					initial={{
						rotateX: -90,
						opacity: 0,
					}}
					animate={{
						rotateX: 0,
						opacity: 1,
					}}
					exit={{
						rotateX: 90,
						opacity: 0,
					}}
					transition={{
						duration: 0.2,
						ease: "easeInOut",
					}}
					style={{
						transformOrigin: "center center",
					}}
					className="inline-block text-xl font-mono font-semibold tabular-nums"
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
			className="flex items-center gap-1 text-xl font-mono"
		>
			<FlipDigit value={hours} label="heures" />
			<span className="animate-pulse text-muted-foreground font-bold">:</span>
			<FlipDigit value={minutes} label="minutes" />
		</div>
	);
};

const useGeolocation = () => {
	const [location, setLocation] = useState<LocationInfo>({
		loading: false,
		geolocationEnabled: false,
	});
	
	// Gérer l'état de la géolocalisation depuis localStorage
	const [geolocationEnabled, setGeolocationEnabled] = useState<boolean>(() => {
		try {
			const saved = localStorage.getItem('patienthub-geolocation-enabled');
			return saved === 'true';
		} catch {
			return false; // Désactivé par défaut
		}
	});

	const reverseGeocode = useCallback(async (lat: number, lon: number) => {
		try {
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
						setLocation({
							city,
							loading: false,
							geolocationEnabled: true,
						});
						return;
					}
				} catch (error) {
					console.warn(`API ${api.url} failed:`, error);
					continue;
				}
			}
			setLocation({
				city: "Paris",
				loading: false,
				geolocationEnabled: false,
			});
		} catch (error) {
			console.warn("All geocoding APIs failed:", error);
			setLocation({
				city: "Paris",
				loading: false,
				geolocationEnabled: false,
			});
		}
	}, []);

	const toggleGeolocation = useCallback(() => {
		const newState = !geolocationEnabled;
		setGeolocationEnabled(newState);
		
		try {
			localStorage.setItem('patienthub-geolocation-enabled', String(newState));
		} catch (error) {
			console.warn('Erreur lors de la sauvegarde de la préférence:', error);
		}

		if (newState) {
			// Activer la géolocalisation
			setLocation({ loading: true, geolocationEnabled: true });
		} else {
			// Désactiver la géolocalisation - retour à Paris
			setLocation({
				city: "Paris",
				loading: false,
				geolocationEnabled: false,
			});
		}
	}, [geolocationEnabled]);

	useEffect(() => {
		// Si géolocalisation désactivée, utiliser Paris
		if (!geolocationEnabled) {
			setLocation({
				city: "Paris",
				loading: false,
				geolocationEnabled: false,
			});
			return;
		}

		// Si géolocalisation activée, demander la position
		if (!navigator.geolocation) {
			setLocation({
				city: "Paris",
				loading: false,
				geolocationEnabled: false,
			});
			return;
		}

		setLocation({ loading: true, geolocationEnabled: true });

		const options = {
			enableHighAccuracy: false,
			timeout: 10000,
			maximumAge: 300000,
		};

		navigator.geolocation.getCurrentPosition(
			(position) => {
				reverseGeocode(
					position.coords.latitude,
					position.coords.longitude
				);
			},
			(error) => {
				console.warn("Geolocation error:", error.message);
				setLocation({
					city: "Paris",
					loading: false,
					geolocationEnabled: false,
				});
			},
			options
		);
	}, [reverseGeocode, geolocationEnabled]);

	return { location, toggleGeolocation };
};

export function AdvancedDateTimeDisplay() {
	const [now, setNow] = useState<Date>(() =>
		toZonedTime(new Date(), timeZone)
	);
	const { location, toggleGeolocation } = useGeolocation();

	useEffect(() => {
		const interval = setInterval(() => {
			setNow(toZonedTime(new Date(), timeZone));
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const dateDisplay = useMemo(
		() =>
			format(now, "PPPP", {
				locale: fr,
			}),
		[now]
	);

	const timeComponents = useMemo(() => {
		const timeStr = format(now, "HH:mm", {
			locale: fr,
		});
		const [hours, minutes] = timeStr.split(":");
		return {
			hours,
			minutes,
		};
	}, [now]);

	const LocationBadge = () => {
		if (location.loading) {
			return (
				<motion.div
					initial={{
						opacity: 0,
						scale: 0.8,
					}}
					animate={{
						opacity: 1,
						scale: 1,
					}}
					className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground"
				>
					<MapPin className="h-3 w-3 animate-pulse" />
					<span>Localisation...</span>
				</motion.div>
			);
		}

		if (location.city) {
			return (
				<motion.button
					initial={{
						opacity: 0,
						y: -10,
					}}
					animate={{
						opacity: 1,
						y: 0,
					}}
					onClick={toggleGeolocation}
					className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer group"
					title={location.geolocationEnabled ? "Cliquer pour désactiver la géolocalisation" : "Cliquer pour activer la géolocalisation"}
				>
					<MapPin className={`h-3 w-3 ${location.geolocationEnabled ? 'text-green-600' : 'text-gray-500'}`} />
					<span>{location.city}</span>
					{location.geolocationEnabled && (
						<div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
					)}
				</motion.button>
			);
		}

		return (
			<button
				onClick={toggleGeolocation}
				className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground hover:bg-muted/70 transition-colors cursor-pointer"
				title="Cliquer pour activer la géolocalisation"
			>
				<Clock className="h-3 w-3" />
				<span>Paris (cliquer pour localiser)</span>
			</button>
		);
	};

	return (
		<motion.div
			initial={{
				opacity: 0,
				y: 10,
			}}
			animate={{
				opacity: 1,
				y: 0,
			}}
			className="hidden md:flex flex-col items-center gap-2 p-4 rounded-lg bg-card border shadow-sm select-none"
			role="banner"
			aria-label="Affichage de la date et heure actuelles"
		>
			<div className="text-sm font-medium text-muted-foreground text-center">
				{dateDisplay} à
			</div>
			<TimeSegment
				hours={timeComponents.hours}
				minutes={timeComponents.minutes}
			/>
			<LocationBadge />
		</motion.div>
	);
}

export function CompactAdvancedDateTime() {
	const [now, setNow] = useState<Date>(() =>
		toZonedTime(new Date(), timeZone)
	);
	const { location, toggleGeolocation } = useGeolocation();

	useEffect(() => {
		const interval = setInterval(() => {
			setNow(toZonedTime(new Date(), timeZone));
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const timeComponents = useMemo(() => {
		const timeStr = format(now, "HH:mm", {
			locale: fr,
		});
		const [hours, minutes] = timeStr.split(":");
		return {
			hours,
			minutes,
		};
	}, [now]);

	const dateDisplay = useMemo(
		() =>
			format(now, "PPPP 'à'", {
				locale: fr,
			}),
		[now]
	);

	return (
		<motion.div
			initial={{
				opacity: 0,
				scale: 0.9,
			}}
			animate={{
				opacity: 1,
				scale: 1,
			}}
			className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 text-sm select-none"
			title={`${dateDisplay} ${format(
				now,
				"HH:mm"
			)} - Timezone: Europe/Paris`}
		>
			<button
				onClick={toggleGeolocation}
				className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
				title={location.geolocationEnabled ? "Cliquer pour désactiver la géolocalisation" : "Cliquer pour activer la géolocalisation"}
			>
				<Clock className="h-4 w-4" />
				<span className="text-xs">{location.city || "Paris"}</span>
				{location.geolocationEnabled && (
					<div className="h-2 w-2 bg-green-500 rounded-full animate-pulse ml-1" />
				)}
			</button>

			<div className="flex items-center gap-1">
				<span className="text-xs text-muted-foreground">
					{dateDisplay}
				</span>
				<div className="flex items-center gap-1 font-mono font-semibold tabular-nums">
					<TimeSegment
						hours={timeComponents.hours}
						minutes={timeComponents.minutes}
					/>
				</div>
			</div>
		</motion.div>
	);
}
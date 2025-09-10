import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const timeZone = "Europe/Paris";

interface LocationInfo {
	city?: string;
	loading: boolean;
	error?: string;
	isCustom?: boolean;
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
	});
	
	// Gérer la ville personnalisée depuis localStorage
	const [customCity, setCustomCity] = useState<string>(() => {
		try {
			return localStorage.getItem('patienthub-custom-city') || '';
		} catch {
			return '';
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
				{
					url: `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=demo`,
					parser: (data: any) => data[0]?.name,
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
			});
		} catch (error) {
			console.warn("All geocoding APIs failed:", error);
			setLocation({
				loading: false,
				error: "Localisation indisponible",
			});
		}
	}, []);

	const updateCustomCity = useCallback((newCity: string) => {
		try {
			if (newCity.trim()) {
				localStorage.setItem('patienthub-custom-city', newCity.trim());
				setCustomCity(newCity.trim());
				setLocation({
					city: newCity.trim(),
					loading: false,
					isCustom: true,
				});
			} else {
				localStorage.removeItem('patienthub-custom-city');
				setCustomCity('');
				// Revenir à la géolocalisation
				setLocation({ loading: true });
			}
		} catch (error) {
			console.warn('Erreur lors de la sauvegarde de la ville:', error);
		}
	}, []);

	useEffect(() => {
		// Si une ville personnalisée existe, l'utiliser
		if (customCity) {
			setLocation({
				city: customCity,
				loading: false,
				isCustom: true,
			});
			return;
		}

		if (!navigator.geolocation) {
			setLocation({
				city: "Paris",
				loading: false,
			});
			return;
		}

		setLocation({
			loading: true,
		});

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
				});
			},
			options
		);
	}, [reverseGeocode, customCity]);

	return { location, updateCustomCity };
};

export function AdvancedDateTimeDisplay() {
	const [now, setNow] = useState<Date>(() =>
		toZonedTime(new Date(), timeZone)
	);
	const { location, updateCustomCity } = useGeolocation();
	const [editingCity, setEditingCity] = useState(false);
	const [tempCity, setTempCity] = useState("");

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

	const handleCityEdit = () => {
		setTempCity(location.city || "Paris");
		setEditingCity(true);
	};

	const handleCitySave = () => {
		updateCustomCity(tempCity);
		setEditingCity(false);
	};

	const handleCityCancel = () => {
		setTempCity("");
		setEditingCity(false);
	};

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
				<Popover open={editingCity} onOpenChange={setEditingCity}>
					<PopoverTrigger asChild>
						<motion.button
							initial={{
								opacity: 0,
								y: -10,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							onClick={handleCityEdit}
							className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer group"
						>
							<MapPin className="h-3 w-3" />
							<span>{location.city}</span>
							<Edit3 className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
						</motion.button>
					</PopoverTrigger>
					<PopoverContent className="w-64 p-3">
						<div className="space-y-3">
							<h4 className="font-medium text-sm">Modifier la ville</h4>
							<Input
								value={tempCity}
								onChange={(e) => setTempCity(e.target.value)}
								placeholder="Nom de la ville"
								onKeyDown={(e) => {
									if (e.key === 'Enter') handleCitySave();
									if (e.key === 'Escape') handleCityCancel();
								}}
								autoFocus
							/>
							<div className="flex gap-2">
								<Button size="sm" onClick={handleCitySave} className="flex-1">
									Valider
								</Button>
								<Button size="sm" variant="outline" onClick={handleCityCancel}>
									Annuler
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								Laissez vide pour utiliser la géolocalisation automatique
							</p>
						</div>
					</PopoverContent>
				</Popover>
			);
		}

		return (
			<div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">
				<Clock className="h-3 w-3" />
				<span>Heure de Paris</span>
			</div>
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
	const { location, updateCustomCity } = useGeolocation();
	const [editingCity, setEditingCity] = useState(false);
	const [tempCity, setTempCity] = useState("");

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

	const handleCityEdit = () => {
		setTempCity(location.city || "Paris");
		setEditingCity(true);
	};

	const handleCitySave = () => {
		updateCustomCity(tempCity);
		setEditingCity(false);
	};

	const handleCityCancel = () => {
		setTempCity("");
		setEditingCity(false);
	};

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
			<Popover open={editingCity} onOpenChange={setEditingCity}>
				<PopoverTrigger asChild>
					<button
						onClick={handleCityEdit}
						className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
					>
						<Clock className="h-4 w-4" />
						<span className="text-xs">{location.city || "Paris"}</span>
						<Edit3 className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-64 p-3">
					<div className="space-y-3">
						<h4 className="font-medium text-sm">Modifier la ville</h4>
						<Input
							value={tempCity}
							onChange={(e) => setTempCity(e.target.value)}
							placeholder="Nom de la ville"
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleCitySave();
								if (e.key === 'Escape') handleCityCancel();
							}}
							autoFocus
						/>
						<div className="flex gap-2">
							<Button size="sm" onClick={handleCitySave} className="flex-1">
								Valider
							</Button>
							<Button size="sm" variant="outline" onClick={handleCityCancel}>
								Annuler
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							Laissez vide pour utiliser la géolocalisation automatique
						</p>
					</div>
				</PopoverContent>
			</Popover>

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
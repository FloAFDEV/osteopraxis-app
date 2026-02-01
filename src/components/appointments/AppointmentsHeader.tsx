import React from "react";
import { HelpButton } from "@/components/ui/help-button";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const AppointmentsHeader = () => {
	const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

	return (
		<div className="relative w-full overflow-hidden rounded-xl shadow-md mb-6">
			{/* Image de fond avec overlay */}
			<div className="relative w-full h-36 md:h-44">
				<img
					src="/images/3b5eb6d0-bf13-4f00-98c8-6cc25a7e5c4f.png"
					alt="Cabinet d'ostéopathie"
					className="w-full h-full object-cover"
					loading="lazy"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-transparent" />

				{/* Contenu */}
				<div className="absolute inset-0 flex items-center">
					<div className="px-6 md:px-8">
						<div className="flex items-center gap-3 mb-2">
							<div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl">
								<Calendar className="h-6 w-6 text-white" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h1 className="text-xl md:text-2xl font-bold text-white">
										Mes Séances
									</h1>
									<HelpButton
										content="Gérez toutes vos séances : passées, présentes et futures. Modifiez les statuts, créez des factures et suivez votre activité."
										className="text-white/70 hover:text-white"
									/>
								</div>
								<p className="text-white/80 text-sm capitalize mt-0.5">
									{today}
								</p>
							</div>
						</div>

						{/* Stats rapides */}
						<div className="flex items-center gap-4 mt-3">
							<div className="flex items-center gap-1.5 text-white/90 text-xs">
								<Clock className="h-3.5 w-3.5" />
								<span>Planification</span>
							</div>
							<div className="flex items-center gap-1.5 text-white/90 text-xs">
								<CheckCircle2 className="h-3.5 w-3.5" />
								<span>Suivi</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AppointmentsHeader;

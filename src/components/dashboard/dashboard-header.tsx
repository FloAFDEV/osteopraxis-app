import React from "react";

export const DashboardHeader: React.FC = () => {
	return (
		<div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-lg shadow-lg animate-fade-in transition-all duration-500 hover:scale-[1.01]">
			<img
				src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600&h=400"
				alt="Cabinet d'ostéopathie"
				className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
				loading="lazy"
			/>
			<div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center">
				<div className="px-6 md:px-10 max-w-2xl animate-fade-in animate-delay-100">
					<h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold mb-2">
						Tableau de bord Praticien
					</h1>
					<p className="text-white/90 text-sm md:text-base lg:text-lg max-w-md">
						Votre espace personnel de gestion d'ostéopathe. Consultez vos patients, rendez-vous et statistiques.
					</p>
				</div>
			</div>
		</div>
	);
};

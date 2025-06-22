
import React from "react";
import { HelpButton } from "@/components/ui/help-button";

const AppointmentsHeader = () => {
  return (
    <div className="relative">
      {/* Medical Header Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg"></div>
      
      {/* Content */}
      <div className="relative z-10 p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Gestion des Séances
          </h1>
          <div className="bg-white rounded-full p-1 shadow-sm">
            <HelpButton 
              content="Ici vous pouvez voir toutes vos séances : passées, présentes et futures. Vous pouvez les organiser, les modifier et suivre leur statut."
              className="text-blue-600 hover:text-blue-800"
            />
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Organisez et suivez vos rendez-vous patients en toute simplicité
        </p>
      </div>
    </div>
  );
};

export default AppointmentsHeader;

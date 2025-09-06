import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

interface EmptyPatientStateProps {
  searchQuery: string;
  activeLetter: string;
  onClearFilter: () => void;
}

const EmptyPatientState: React.FC<EmptyPatientStateProps> = ({
  searchQuery,
  activeLetter,
  onClearFilter,
}) => {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="text-center py-16 rounded-lg border border-dashed bg-gradient-to-br from-[#fafdffee] via-[#eaf4eedd] to-[#f5fafafd] dark:from-[#19272dff] dark:to-[#2e474aff] shadow-sm relative overflow-hidden">
          {/* Background wave SVG */}
          <svg
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-0 bottom-0 w-full h-40 pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="waveGradientPatients" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#B8DDD7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#A2C6CB" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
              d="M0,64 C360,120 1080,0 1440,64 L1440,160 L0,160Z"
              fill="url(#waveGradientPatients)"
            />
            <path
              d="M0,96 C480,160 960,32 1440,96 L1440,160 L0,160Z"
              fill="url(#waveGradientPatients)"
              opacity="0.6"
            />
          </svg>

          {/* Logo circulaire + icône Users */}
          <div className="relative mx-auto mb-8 w-28 h-28">
            <img
              src="/lovable-uploads/256dca24-4b34-4c54-9acf-3556dfb11b34.png"
              alt="Logo ostéopathe"
              className="w-28 h-28 object-cover rounded-full border-8 border-white shadow-lg bg-[#eaf4ef]"
              loading="lazy"
            />
            <Users className="absolute inset-0 m-auto h-12 w-12 text-blue-500 opacity-80" />
          </div>

          <h3 className="text-2xl font-semibold text-[#2a585a] dark:text-white mb-2">
            Aucun patient trouvé
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-base">
            {searchQuery || activeLetter
              ? "Aucun patient ne correspond à vos critères de recherche."
              : "Aucun patient n'a été ajouté pour le moment."}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {(searchQuery || activeLetter) && (
              <Button onClick={onClearFilter} variant="outline">
                Afficher tous les patients
              </Button>
            )}

            <Button asChild>
              <Link to="/patients/new">
                <Plus className="mr-2 h-5 w-5" /> Créer un nouveau patient
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyPatientState;

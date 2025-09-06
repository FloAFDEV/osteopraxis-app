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
          {/* Illustration circulaire avec badge Users */}
          <div className="relative mx-auto mb-8 w-28 h-28">
            <img
              src="/lovable-uploads/256dca24-4b34-4c54-9acf-3556dfb11b34.png"
              alt="Logo ostéopathe"
              className="w-28 h-28 object-cover rounded-full border-8 border-white shadow-lg bg-[#eaf4ef]"
            />
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full shadow-md p-2">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
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

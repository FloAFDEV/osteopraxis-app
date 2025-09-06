import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import React from "react";

export default function AppointmentsEmptyState() {
  return (
    <Card className="w-full relative overflow-hidden">
      <CardContent className="pt-6">
        {/* Vagues full-width */}
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-0 bottom-0 w-full h-36 pointer-events-none"
          aria-hidden="true"
        >
          <path
            d="M0,64 C360,120 1080,0 1440,64 L1440,160 L0,160Z"
            fill="#B8DDD7"
            fillOpacity="0.33"
          />
          <path
            d="M0,96 C480,160 960,32 1440,96 L1440,160 L0,160Z"
            fill="#A2C6CB"
            fillOpacity="0.2"
          />
        </svg>

        <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
          <div className="mb-4 relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            {/* Badge Calendar */}
            <Calendar className="h-12 w-12 text-blue-500 absolute inset-0 m-auto" />
          </div>

          <h3 className="text-xl font-medium mb-2">Aucune séance trouvée</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Commencez par créer une nouvelle séance pour enrichir votre suivi patient.
            <br />
            Toutes vos consultations seront affichées ici, organisées avec soin.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/appointments/new">
                <Plus className="mr-2 h-4 w-4" /> Créer une séance
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


import { Layout } from "@/components/ui/layout";
import { Users } from "lucide-react";
import { ReplacementManagement } from "@/components/osteopath/ReplacementManagement";
import { CabinetAssociationManagement } from "@/components/osteopath/CabinetAssociationManagement";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/ui/back-button";

const CollaborationsSettingsPage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <BackButton to="/settings" />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-amber-500" />
            Collaborations
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos associations de cabinet et remplacements avec d'autres ostéopathes
          </p>
        </div>

        {/* Section Gestion des Associations Cabinet */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Associations Cabinet</h2>
          <p className="text-muted-foreground mb-4">
            Associez-vous à des cabinets existants pour partager des patients et collaborer.
          </p>
          <CabinetAssociationManagement />
        </div>

        {/* Séparateur */}
        <Separator />

        {/* Section Gestion des Remplacements */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Gestion des Remplacements</h2>
          <p className="text-muted-foreground mb-4">
            Configurez vos remplacements avec d'autres ostéopathes.
          </p>
          <ReplacementManagement />
        </div>
      </div>
    </Layout>
  );
};

export default CollaborationsSettingsPage;

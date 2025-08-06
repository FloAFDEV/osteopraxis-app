
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Cabinet } from "@/types";
import { api } from "@/services";
import { useAuth } from "@/contexts/AuthContext";

export function CabinetList() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCabinets();
  }, []);

  const loadCabinets = async () => {
    try {
      setLoading(true);
      const cabinetData = await api.getCabinets();
      setCabinets(cabinetData);
    } catch (error) {
      console.error('Erreur lors du chargement des cabinets:', error);
      toast.error("Erreur", {
        description: "Impossible de charger les cabinets"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mes cabinets</h1>
          <p className="text-muted-foreground">
            Gérez vos cabinets d'ostéopathie
          </p>
        </div>
        <Button onClick={() => window.location.href = '/cabinets/new'}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau cabinet
        </Button>
      </div>

      {cabinets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucun cabinet trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premier cabinet
            </p>
            <Button onClick={() => window.location.href = '/cabinets/new'}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un cabinet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cabinets.map((cabinet) => (
            <Card key={cabinet.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {cabinet.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {cabinet.address && (
                    <p>{cabinet.address}</p>
                  )}
                  {cabinet.email && (
                    <p>{cabinet.email}</p>
                  )}
                  {cabinet.phone && (
                    <p>{cabinet.phone}</p>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `/cabinets/${cabinet.id}/edit`}
                  >
                    Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

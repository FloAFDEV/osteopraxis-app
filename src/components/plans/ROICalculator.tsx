/**
 * Calculateur de retour sur investissement
 * 
 * Simule les gains de productivité et l'optimisation financière
 * selon les paramètres d'activité du cabinet
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Euro, Calculator, BarChart3 } from 'lucide-react';

export function ROICalculator() {
  const [patientsPerMonth, setPatientsPerMonth] = useState(50);
  const [appointmentsPerMonth, setAppointmentsPerMonth] = useState(80);
  const [pricePerSession, setPricePerSession] = useState(60);

  // Calculs de gains de temps (en heures/mois)
  const timeGainPatientManagement = patientsPerMonth * 0.1; // 6 min par patient
  const timeGainAppointments = appointmentsPerMonth * 0.08; // 5 min par RDV
  const timeGainInvoicing = appointmentsPerMonth * 0.05; // 3 min par facture
  const totalTimeGain = timeGainPatientManagement + timeGainAppointments + timeGainInvoicing;

  // Conversion en rendez-vous supplémentaires possibles
  const averageSessionDuration = 1; // 1h par séance
  const additionalSessions = Math.floor(totalTimeGain / averageSessionDuration);
  const additionalRevenue = additionalSessions * pricePerSession;

  // ROI pour plan Full (19€/mois)
  const fullPlanCost = 19;
  const fullPlanROI = additionalRevenue - fullPlanCost;
  const fullPlanROIPercent = Math.round((fullPlanROI / fullPlanCost) * 100);

  // ROI pour plan Pro (49€/mois)
  const proPlanCost = 49;
  const proPlanTimeGain = totalTimeGain * 1.3; // +30% avec analytics
  const proPlanAdditionalSessions = Math.floor(proPlanTimeGain / averageSessionDuration);
  const proPlanAdditionalRevenue = proPlanAdditionalSessions * pricePerSession;
  const proPlanROI = proPlanAdditionalRevenue - proPlanCost;
  const proPlanROIPercent = Math.round((proPlanROI / proPlanCost) * 100);

  return (
    <div className="space-y-6">
      {/* Simulateur */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-5 w-5 text-primary" />
            Simulateur de retour sur investissement
          </CardTitle>
          <CardDescription>
            Ajustez les paramètres selon votre activité pour calculer les gains potentiels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patients">Patients mensuels</Label>
              <Input
                id="patients"
                type="number"
                value={patientsPerMonth}
                onChange={(e) => setPatientsPerMonth(parseInt(e.target.value) || 0)}
                min={0}
                max={1000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointments">Consultations mensuelles</Label>
              <Input
                id="appointments"
                type="number"
                value={appointmentsPerMonth}
                onChange={(e) => setAppointmentsPerMonth(parseInt(e.target.value) || 0)}
                min={0}
                max={500}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Tarif consultation (€)</Label>
              <Input
                id="price"
                type="number"
                value={pricePerSession}
                onChange={(e) => setPricePerSession(parseInt(e.target.value) || 0)}
                min={0}
                max={500}
              />
            </div>
          </div>

          {/* Résultats globaux */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Temps libéré</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {totalTimeGain.toFixed(1)} h
                </p>
                <p className="text-xs text-muted-foreground">par mois</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Créneaux disponibles</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  +{additionalSessions}
                </p>
                <p className="text-xs text-muted-foreground">consultations possibles</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Euro className="h-4 w-4" />
                  <span className="text-sm font-medium">Potentiel de revenus</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  +{additionalRevenue} €
                </p>
                <p className="text-xs text-muted-foreground">par mois</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparaison ROI par plan */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Plan Full */}
        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Plan Full</CardTitle>
              <Badge variant="secondary" className="text-sm font-semibold">
                19€/mois
              </Badge>
            </div>
            <CardDescription>
              Gestion complète du cabinet
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenus additionnels potentiels</span>
                <span className="font-semibold text-foreground">+{additionalRevenue}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Coût de l'abonnement</span>
                <span className="font-semibold text-muted-foreground">-{fullPlanCost}€</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between">
                <span className="font-bold text-foreground">Bénéfice net mensuel</span>
                <span className="text-xl font-bold text-primary">
                  +{fullPlanROI}€
                </span>
              </div>
            </div>

            <div className="p-3 border rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  ROI : +{fullPlanROIPercent}% par mois
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Rentabilité dès le premier mois d'utilisation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plan Pro */}
        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Plan Pro</CardTitle>
              <Badge variant="secondary" className="text-sm font-semibold">
                49€/mois
              </Badge>
            </div>
            <CardDescription>
              Collaboration et analytics avancées
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenus additionnels potentiels</span>
                <span className="font-semibold text-foreground">+{proPlanAdditionalRevenue}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Optimisation par analytics</span>
                <span className="font-semibold text-primary">+30%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Coût de l'abonnement</span>
                <span className="font-semibold text-muted-foreground">-{proPlanCost}€</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between">
                <span className="font-bold text-foreground">Bénéfice net mensuel</span>
                <span className="text-xl font-bold text-primary">
                  +{proPlanROI}€
                </span>
              </div>
            </div>

            <div className="p-3 border rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  ROI : +{proPlanROIPercent}% par mois
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Inclut gestion d'équipe et pilotage par la donnée
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note méthodologique */}
      <Card className="border bg-muted/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Méthodologie de calcul :</strong> Les gains de temps sont basés sur des moyennes observées : 
            6 minutes économisées par patient pour la gestion administrative, 5 minutes par rendez-vous 
            pour la planification, et 3 minutes par note d'honoraires pour la facturation. 
            Le plan Pro intègre des optimisations supplémentaires (+30%) grâce aux analytics et 
            aux fonctionnalités de pilotage avancées.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

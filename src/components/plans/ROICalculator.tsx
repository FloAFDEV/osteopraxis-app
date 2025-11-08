/**
 * 💰 ROI Calculator - Simulateur de retour sur investissement
 * 
 * Calcule les gains de productivité et économies potentielles
 * selon le nombre de patients et rendez-vous mensuels
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Euro, Sparkles, Calculator } from 'lucide-react';

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
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="h-6 w-6 text-blue-600" />
            Calculez vos gains de productivité
          </CardTitle>
          <CardDescription>
            Ajustez les valeurs selon votre activité pour voir votre ROI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patients">Patients / mois</Label>
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
              <Label htmlFor="appointments">Rendez-vous / mois</Label>
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
              <Label htmlFor="price">Prix séance (€)</Label>
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
          <div className="p-4 bg-white rounded-lg border-2 border-blue-300 shadow-sm">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm font-medium">Temps économisé</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {totalTimeGain.toFixed(1)}h
                </p>
                <p className="text-xs text-muted-foreground">par mois</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">Séances supplémentaires</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  +{additionalSessions}
                </p>
                <p className="text-xs text-muted-foreground">rendez-vous possibles</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                  <Euro className="h-5 w-5" />
                  <span className="text-sm font-medium">Revenus potentiels</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  +{additionalRevenue}€
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
        <Card className="border-2 border-amber-300 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Plan Full</CardTitle>
              <Badge className="bg-amber-500">19€/mois</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenus supplémentaires</span>
                <span className="font-semibold text-green-600">+{additionalRevenue}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Coût de l'abonnement</span>
                <span className="font-semibold text-red-600">-{fullPlanCost}€</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between">
                <span className="font-bold">Gain net mensuel</span>
                <span className="text-xl font-bold text-green-600">
                  +{fullPlanROI}€
                </span>
              </div>
            </div>

            <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                ROI: +{fullPlanROIPercent}% / mois
              </p>
              <p className="text-xs text-green-800 mt-1">
                Rentable dès le 1er mois !
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plan Pro */}
        <Card className="border-2 border-purple-300 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Plan Pro</CardTitle>
              <Badge className="bg-purple-600">49€/mois</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenus supplémentaires</span>
                <span className="font-semibold text-green-600">+{proPlanAdditionalRevenue}€</span>
              </div>
              <div className="flex justify-between text-sm text-purple-600">
                <span>Analytics & optimisations</span>
                <span className="font-semibold">+30%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Coût de l'abonnement</span>
                <span className="font-semibold text-red-600">-{proPlanCost}€</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between">
                <span className="font-bold">Gain net mensuel</span>
                <span className="text-xl font-bold text-purple-600">
                  +{proPlanROI}€
                </span>
              </div>
            </div>

            <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg">
              <p className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                ROI: +{proPlanROIPercent}% / mois
              </p>
              <p className="text-xs text-purple-800 mt-1">
                Inclut gestion d'équipe et analytics !
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note explicative */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Méthodologie :</strong> Ces estimations sont basées sur des gains de temps moyens constatés : 
            6 min/patient pour la gestion, 5 min/RDV pour la planification, et 3 min/facture pour la facturation. 
            Le plan Pro offre 30% de gains supplémentaires grâce aux analytics et optimisations avancées.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

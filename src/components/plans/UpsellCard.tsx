/**
 * Composant de carte d'upsell pour inviter à upgrader vers le plan Full
 */

import { ArrowRight, Calendar, FileText, Layout } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UpsellCardProps {
  feature: 'appointments' | 'invoices' | 'schedule';
  className?: string;
}

export const UpsellCard = ({ feature, className }: UpsellCardProps) => {
  const navigate = useNavigate();

  const config = {
    appointments: {
      icon: Calendar,
      title: "Gestion des rendez-vous",
      description: "Organisez votre agenda, gérez les rendez-vous et envoyez des rappels automatiques à vos patients.",
      benefits: [
        "Agenda intégré avec vue mensuelle",
        "Rappels automatiques par email",
        "Gestion des annulations",
        "Historique complet des consultations"
      ]
    },
    invoices: {
      icon: FileText,
      title: "Facturation automatique",
      description: "Créez et gérez vos factures professionnelles en quelques clics, avec export PDF et suivi des paiements.",
      benefits: [
        "Génération automatique de factures",
        "Export PDF professionnel",
        "Suivi des paiements",
        "Statistiques de revenus"
      ]
    },
    schedule: {
      icon: Layout,
      title: "Planning hebdomadaire",
      description: "Visualisez votre planning complet de la semaine avec une vue d'ensemble de tous vos rendez-vous.",
      benefits: [
        "Vue hebdomadaire interactive",
        "Gestion par cabinet",
        "Filtres avancés",
        "Synchronisation temps réel"
      ]
    }
  };

  const { icon: Icon, title, description, benefits } = config[feature];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Inclus dans le plan Full :</p>
          <ul className="space-y-1.5">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <Button 
          className="w-full" 
          onClick={() => navigate('/settings')}
        >
          Découvrir le plan Full
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Essai gratuit 14 jours • Sans engagement
        </p>
      </CardContent>
    </Card>
  );
};

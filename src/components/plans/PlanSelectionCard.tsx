/**
 * Composant de carte pour la sélection de plan tarifaire
 */

import { Check, Sparkles, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PlanSelectionCardProps {
  planType: 'light' | 'full' | 'pro';
  title: string;
  description: string;
  price: string;
  priceDetail?: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onSelect?: () => void;
  loading?: boolean;
}

export const PlanSelectionCard = ({
  planType,
  title,
  description,
  price,
  priceDetail,
  features,
  isPopular = false,
  isCurrentPlan = false,
  onSelect,
  loading = false,
}: PlanSelectionCardProps) => {
  const getPlanIcon = () => {
    switch (planType) {
      case 'light':
        return <Sparkles className="h-6 w-6" />;
      case 'full':
        return <Check className="h-6 w-6" />;
      case 'pro':
        return <Users className="h-6 w-6" />;
    }
  };

  return (
    <Card 
      className={cn(
        "relative transition-all hover:shadow-lg",
        isPopular && "border-primary shadow-md scale-105"
      )}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Le plus populaire
        </Badge>
      )}
      
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            planType === 'light' && "bg-blue-100 text-blue-600",
            planType === 'full' && "bg-green-100 text-green-600",
            planType === 'pro' && "bg-purple-100 text-purple-600"
          )}>
            {getPlanIcon()}
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {isCurrentPlan && (
              <Badge variant="outline" className="mt-1">Plan actuel</Badge>
            )}
          </div>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{price}</span>
            {priceDetail && (
              <span className="text-muted-foreground">{priceDetail}</span>
            )}
          </div>
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <span className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground">—</span>
              )}
              <span className={cn(
                "text-sm",
                !feature.included && "text-muted-foreground line-through"
              )}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full"
          onClick={onSelect}
          disabled={isCurrentPlan || loading}
          variant={isPopular ? "default" : "outline"}
        >
          {isCurrentPlan ? "Plan actuel" : loading ? "Chargement..." : "Choisir ce plan"}
        </Button>
      </CardFooter>
    </Card>
  );
};

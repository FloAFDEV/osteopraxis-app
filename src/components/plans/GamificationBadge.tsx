/**
 * 🏆 GamificationBadge - Composant d'affichage de badge
 * 
 * Affiche un badge avec son état (débloqué/verrouillé) et sa progression
 */

import { Badge as BadgeType } from '@/hooks/useGamification';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lock } from 'lucide-react';

interface GamificationBadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
}

export function GamificationBadge({ badge, size = 'md' }: GamificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const containerClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <Card
      className={`
        ${containerClasses[size]} 
        relative overflow-hidden transition-all
        ${badge.unlocked 
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-md' 
          : 'bg-muted/30 border-muted opacity-60'
        }
      `}
    >
      {/* Badge Icon */}
      <div className="text-center mb-2">
        <div className={`${sizeClasses[size]} ${!badge.unlocked && 'grayscale opacity-40'}`}>
          {badge.unlocked ? badge.icon : <Lock className="h-8 w-8 mx-auto text-muted-foreground" />}
        </div>
      </div>

      {/* Badge Name */}
      <h4 className={`
        font-bold text-center mb-1
        ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}
        ${badge.unlocked ? 'text-foreground' : 'text-muted-foreground'}
      `}>
        {badge.name}
      </h4>

      {/* Badge Description */}
      <p className={`
        text-center mb-2
        ${size === 'sm' ? 'text-xs' : 'text-sm'}
        text-muted-foreground
      `}>
        {badge.description}
      </p>

      {/* Progress Bar */}
      {!badge.unlocked && (
        <div className="space-y-1">
          <Progress value={(badge.progress / badge.maxProgress) * 100} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {badge.progress} / {badge.maxProgress}
          </p>
        </div>
      )}

      {/* Unlocked Date */}
      {badge.unlocked && badge.unlockedAt && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
        </p>
      )}
    </Card>
  );
}

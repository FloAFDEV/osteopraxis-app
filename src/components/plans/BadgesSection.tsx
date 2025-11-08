/**
 * 🎖️ BadgesSection - Section d'affichage des badges dans Settings
 * 
 * Affiche tous les badges avec progression et statistiques
 */

import { useGamification } from '@/hooks/useGamification';
import { GamificationBadge } from './GamificationBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Target } from 'lucide-react';

export function BadgesSection() {
  const { badges, stats, getProgress, resetProgress } = useGamification();
  const progress = getProgress();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Badges de Progression
            </CardTitle>
            <CardDescription>
              Débloquez des badges en explorant les fonctionnalités
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetProgress}
            className="text-xs"
          >
            Réinitialiser
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {progress.unlocked}/{progress.total}
                </p>
                <p className="text-sm text-muted-foreground">Badges débloqués</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalAttempts}</p>
                <p className="text-sm text-muted-foreground">Tentatives totales</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.featuresAttempted.length}
                </p>
                <p className="text-sm text-muted-foreground">Features explorées</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progression globale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progression globale</span>
            <span className="text-muted-foreground">{Math.round(progress.percentage)}%</span>
          </div>
          <Progress value={progress.percentage} className="h-3" />
        </div>

        {/* Grille de badges */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Tous les badges</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map(badge => (
              <GamificationBadge key={badge.id} badge={badge} size="md" />
            ))}
          </div>
        </div>

        {/* Message d'encouragement */}
        {progress.unlocked < progress.total && (
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <p className="text-sm text-center text-foreground">
              💡 <strong>Astuce:</strong> Explorez les différentes fonctionnalités pour débloquer tous les badges et découvrir ce qui pourrait transformer votre pratique !
            </p>
          </Card>
        )}

        {progress.unlocked === progress.total && (
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
            <p className="text-sm text-center text-foreground font-semibold">
              🎉 Félicitations ! Vous avez débloqué tous les badges ! Vous êtes prêt à passer au niveau supérieur avec un plan premium.
            </p>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

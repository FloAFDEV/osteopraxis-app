/**
 * Floating Action Button (FAB)
 * Actions rapides accessibles partout (nouveau patient, nouvelle séance)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, User, Calendar, FileText, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: User,
    label: 'Nouveau patient',
    href: '/patients/new',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    icon: Calendar,
    label: 'Nouvelle séance',
    href: '/appointments/new',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    icon: FileText,
    label: 'Nouvelle facture',
    href: '/invoices/new',
    color: 'bg-emerald-500 hover:bg-emerald-600',
  },
];

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
      {/* Actions rapides (affichées quand ouvert) */}
      {isOpen && (
        <div className="flex flex-col-reverse gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                to={action.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-full shadow-lg text-white font-medium',
                  'transition-all hover:scale-105 hover:shadow-xl',
                  action.color
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="pr-1">{action.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bouton principal */}
      <Button
        size="icon"
        className={cn(
          'h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110',
          'bg-primary hover:bg-primary/90',
          isOpen && 'rotate-45'
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fermer les actions rapides' : 'Ouvrir les actions rapides'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}

/**
 * Variante compacte pour mobile
 */
export function FloatingActionButtonMobile() {
  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <div className="flex flex-col-reverse gap-2">
        <Link to="/patients/new">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600"
            aria-label="Nouveau patient"
          >
            <User className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * FAB contextuel pour une page spécifique
 * Ex: Sur la page patients, FAB = "Nouveau patient" uniquement
 */
interface ContextualFABProps {
  action: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
  };
  className?: string;
}

export function ContextualFAB({ action, className }: ContextualFABProps) {
  const Icon = action.icon;

  return (
    <Link
      to={action.href}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'flex items-center gap-2 px-5 py-3 rounded-full shadow-lg',
        'bg-primary text-primary-foreground font-medium',
        'transition-all hover:scale-105 hover:shadow-xl',
        className
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="hidden sm:inline">{action.label}</span>
    </Link>
  );
}

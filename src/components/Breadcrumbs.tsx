/**
 * Composant Breadcrumb (fil d'Ariane)
 * Améliore la navigation et le contexte utilisateur
 */

import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm text-muted-foreground mb-4', className)}
    >
      <ol className="flex items-center gap-2">
        {/* Accueil toujours en premier */}
        <li>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Accueil</span>
          </Link>
        </li>

        {/* Items du breadcrumb */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />

              {isLast ? (
                <span
                  className="flex items-center gap-1.5 font-medium text-foreground"
                  aria-current="page"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              ) : (
                <span className="flex items-center gap-1.5">
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Hook helper pour générer des breadcrumbs communs
 */
export function useBreadcrumbs() {
  return {
    // Dashboard > Patients
    patients: (): BreadcrumbItem[] => [{ label: 'Patients', href: '/patients' }],

    // Dashboard > Patients > Jean Dupont
    patientDetail: (patientName: string): BreadcrumbItem[] => [
      { label: 'Patients', href: '/patients' },
      { label: patientName },
    ],

    // Dashboard > Patients > Nouveau patient
    newPatient: (): BreadcrumbItem[] => [
      { label: 'Patients', href: '/patients' },
      { label: 'Nouveau patient' },
    ],

    // Dashboard > Séances
    appointments: (): BreadcrumbItem[] => [{ label: 'Séances', href: '/appointments' }],

    // Dashboard > Planning
    schedule: (): BreadcrumbItem[] => [{ label: 'Planning', href: '/schedule' }],

    // Dashboard > Factures
    invoices: (): BreadcrumbItem[] => [{ label: 'Factures', href: '/invoices' }],

    // Dashboard > Factures > Nouvelle facture
    newInvoice: (): BreadcrumbItem[] => [
      { label: 'Factures', href: '/invoices' },
      { label: 'Nouvelle facture' },
    ],

    // Dashboard > Paramètres
    settings: (): BreadcrumbItem[] => [{ label: 'Paramètres', href: '/settings' }],

    // Dashboard > Admin > Ostéopathes
    adminOsteopaths: (): BreadcrumbItem[] => [
      { label: 'Administration', href: '/admin' },
      { label: 'Ostéopathes' },
    ],
  };
}

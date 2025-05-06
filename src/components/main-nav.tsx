
import { Link } from "react-router-dom";

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  return (
    <div className={`flex items-center space-x-4 lg:space-x-6 ${className}`}>
      <Link
        to="/dashboard"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Tableau de bord
      </Link>
      <Link
        to="/patients"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Patients
      </Link>
      <Link
        to="/appointments"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Rendez-vous
      </Link>
      <Link
        to="/invoices"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Factures
      </Link>
    </div>
  );
}

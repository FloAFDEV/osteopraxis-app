
import React, { useState, useEffect } from 'react';
import { SubscriptionBanner } from './SubscriptionBanner';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

interface SubscriptionGuardProps {
  action: 'create_patient' | 'create_cabinet' | 'access_invoices' | 'access_advanced_stats' | 'export_data';
  feature?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  action,
  feature,
  children,
  fallback
}) => {
  const { canPerformAction, loading } = useSubscriptionLimits();
  const [canPerform, setCanPerform] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      const result = await canPerformAction(action);
      setCanPerform(result);
    };

    if (!loading) {
      checkPermission();
    }
  }, [action, canPerformAction, loading]);

  if (loading || canPerform === null) {
    return <div>Vérification des permissions...</div>;
  }

  if (!canPerform) {
    return fallback || <SubscriptionBanner action={action} feature={feature} />;
  }

  return <>{children}</>;
};

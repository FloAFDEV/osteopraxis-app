import { Clock, AlertTriangle } from 'lucide-react';
import { useDemoSession } from '@/hooks/useDemoSession';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { useEffect, useState } from 'react';

export const DemoSessionTimer = () => {
  const { session, paywallReason } = useDemoSession();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (paywallReason === 'timer_expired') {
      setShowPaywall(true);
    }
  }, [paywallReason]);

  if (!session?.isActive) {
    return null;
  }

  const isLowTime = session.remainingMs < 5 * 60 * 1000; // Moins de 5 minutes

  return (
    <>
      <div
        className={`
        fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border z-50 min-w-[280px]
        ${isLowTime ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}
      `}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {isLowTime ? (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            ) : (
              <Clock className="h-5 w-5 text-gray-500" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="font-medium text-gray-900">Session démo</div>

            <div className="text-sm text-gray-600">
              Temps restant:{' '}
              <span className={`font-mono font-medium ${isLowTime ? 'text-orange-600' : 'text-gray-900'}`}>
                {session.remainingFormatted}
              </span>
            </div>

            {isLowTime && (
              <div className="text-xs text-orange-600">⚠️ Session bientôt expirée</div>
            )}

            <div className="text-xs text-gray-500">
              {session.limits.patients.current}/{session.limits.patients.max} patients •{' '}
              {session.limits.appointments.current}/{session.limits.appointments.max} RDV
            </div>
          </div>
        </div>
      </div>

      {/* Paywall bloquant si timer expiré */}
      {showPaywall && paywallReason && (
        <PaywallModal
          isOpen={showPaywall}
          reason={paywallReason}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </>
  );
};

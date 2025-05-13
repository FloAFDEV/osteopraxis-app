
import { PaymentStatus } from '@/types';

/**
 * Traduit les statuts de paiement en français
 */
export const translatePaymentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'En attente',
    'PAID': 'Payé',
    'CANCELLED': 'Annulé',
    'REFUNDED': 'Remboursé',
    'PARTIALLY_PAID': 'Partiellement payé'
  };
  
  return statusMap[status] || status;
};

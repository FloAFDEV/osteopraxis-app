import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hybridInvoiceService } from '@/services/hybrid-invoice-service';
import { Invoice } from '@/types';
import { toast } from 'sonner';
import { useDemo } from '@/contexts/DemoContext';

/**
 * Hook pour la gestion des factures via l'architecture hybride
 */
export function useHybridInvoices() {
  const queryClient = useQueryClient();
  const { isDemoMode } = useDemo();

  // Récupération de toutes les factures
  const {
    data: invoices,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['hybrid-invoices', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return []; // Retourner un tableau vide en mode démo
      }
      return hybridInvoiceService.getInvoices();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Hook spécialisé pour récupérer une facture par ID
  const useInvoiceById = (id: number) => {
    return useQuery({
      queryKey: ['hybrid-invoice', id, isDemoMode],
      queryFn: async () => {
        if (isDemoMode) {
          return null;
        }
        return hybridInvoiceService.getInvoiceById(id);
      },
      enabled: !!id && !isDemoMode,
      staleTime: 1000 * 60 * 5,
    });
  };

  // Hook spécialisé pour récupérer les factures d'un patient
  const useInvoicesByPatient = (patientId: number) => {
    return useQuery({
      queryKey: ['hybrid-invoices-patient', patientId, isDemoMode],
      queryFn: async () => {
        if (isDemoMode) {
          return [];
        }
        return hybridInvoiceService.getInvoicesByPatientId(patientId);
      },
      enabled: !!patientId && !isDemoMode,
      staleTime: 1000 * 60 * 5,
    });
  };

  // Mutation pour créer/modifier une facture
  const invoiceMutation = useMutation({
    mutationFn: async ({ 
      action, 
      data, 
      id 
    }: { 
      action: 'create' | 'update';
      data: any;
      id?: number;
    }) => {
      if (isDemoMode) {
        throw new Error('Fonctionnalité non disponible en mode démo');
      }

      if (action === 'create') {
        return hybridInvoiceService.createInvoice(data);
      } else {
        if (!id) throw new Error('ID requis pour la mise à jour');
        return hybridInvoiceService.updateInvoice(id, data);
      }
    },
    onSuccess: (data, variables) => {
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['hybrid-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['hybrid-invoice'] });
      queryClient.invalidateQueries({ queryKey: ['hybrid-invoices-patient'] });
      
      const action = variables.action === 'create' ? 'créée' : 'modifiée';
      toast.success(`Facture ${action} avec succès`);
    },
    onError: (error) => {
      console.error('Invoice mutation error:', error);
      toast.error('Erreur lors de l\'opération sur la facture');
    },
  });

  // Mutation pour supprimer une facture
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      if (isDemoMode) {
        throw new Error('Fonctionnalité non disponible en mode démo');
      }
      return hybridInvoiceService.deleteInvoice(id);
    },
    onSuccess: () => {
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['hybrid-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['hybrid-invoice'] });
      queryClient.invalidateQueries({ queryKey: ['hybrid-invoices-patient'] });
      
      toast.success('Facture supprimée avec succès');
    },
    onError: (error) => {
      console.error('Delete invoice error:', error);
      toast.error('Erreur lors de la suppression de la facture');
    },
  });

  // Fonctions helper
  const createInvoice = (data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    return invoiceMutation.mutateAsync({ action: 'create', data });
  };

  const updateInvoice = (id: number, data: Partial<Invoice>) => {
    return invoiceMutation.mutateAsync({ action: 'update', data, id });
  };

  const deleteInvoice = (id: number) => {
    return deleteInvoiceMutation.mutateAsync(id);
  };

  return {
    // Données
    invoices: invoices || [],
    isLoading,
    error,
    refetch,

    // Hooks spécialisés
    useInvoiceById,
    useInvoicesByPatient,

    // Actions
    createInvoice,
    updateInvoice,
    deleteInvoice,

    // États des mutations
    isCreating: invoiceMutation.isPending && invoiceMutation.variables?.action === 'create',
    isUpdating: invoiceMutation.isPending && invoiceMutation.variables?.action === 'update',
    isDeleting: deleteInvoiceMutation.isPending,
  };
}
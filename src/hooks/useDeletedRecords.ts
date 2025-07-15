import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin-service';
import { toast } from 'sonner';

export const useDeletedRecords = () => {
  const [deletedPatients, setDeletedPatients] = useState<any[]>([]);
  const [deletedAppointments, setDeletedAppointments] = useState<any[]>([]);
  const [deletedInvoices, setDeletedInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDeletedRecords = async () => {
    setIsLoading(true);
    try {
      const [patients, appointments, invoices] = await Promise.all([
        adminService.getDeletedPatients(),
        adminService.getDeletedAppointments(),
        adminService.getDeletedInvoices()
      ]);

      setDeletedPatients(patients);
      setDeletedAppointments(appointments);
      setDeletedInvoices(invoices);
    } catch (error) {
      console.error('Erreur lors de la récupération des données supprimées:', error);
      toast.error('Erreur lors de la récupération des données supprimées');
    } finally {
      setIsLoading(false);
    }
  };

  const restoreRecord = async (tableName: string, recordId: string) => {
    try {
      const success = await adminService.restoreRecord(tableName, recordId);
      if (success) {
        toast.success('Données restaurées avec succès');
        await fetchDeletedRecords(); // Refresh la liste
      }
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      toast.error('Erreur lors de la restauration');
    }
  };

  const softDeleteRecord = async (tableName: string, recordId: string) => {
    try {
      const success = await adminService.softDeleteRecord(tableName, recordId);
      if (success) {
        toast.success('Données supprimées (récupérables)');
        await fetchDeletedRecords(); // Refresh la liste
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    fetchDeletedRecords();
  }, []);

  return {
    deletedPatients,
    deletedAppointments,
    deletedInvoices,
    isLoading,
    restoreRecord,
    softDeleteRecord,
    refreshDeletedRecords: fetchDeletedRecords
  };
};
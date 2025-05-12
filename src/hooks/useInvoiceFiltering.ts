
import { Invoice, Patient } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo } from "react";

export const useInvoiceFiltering = (
  invoices: Invoice[] | undefined,
  searchQuery: string,
  statusFilter: string,
  patientDataMap: Map<number, Patient>
) => {
  // Filter invoices based on search query and status
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    
    return invoices.filter((invoice) => {
      // Filter by payment status
      if (statusFilter !== "ALL" && invoice.paymentStatus !== statusFilter) {
        return false;
      }
      
      // Filter by search query (patient name)
      if (searchQuery.trim() !== "") {
        const patient = patientDataMap.get(invoice.patientId);
        if (!patient) return false;
        
        const patientFullName = `${patient.lastName} ${patient.firstName}`.toLowerCase();
        if (!patientFullName.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });
  }, [invoices, searchQuery, statusFilter, patientDataMap]);

  // Group invoices by year and month
  const groupInvoicesByYearAndMonth = useMemo(() => {
    const groupedData: Record<string, Record<string, Invoice[]>> = {};
    
    if (!filteredInvoices.length) return groupedData;
    
    filteredInvoices.forEach((invoice) => {
      const date = new Date(invoice.date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthKey = `${year}-${month}`;
      
      if (!groupedData[year]) {
        groupedData[year] = {};
      }
      
      if (!groupedData[year][monthKey]) {
        groupedData[year][monthKey] = [];
      }
      
      groupedData[year][monthKey].push(invoice);
    });
    
    return groupedData;
  }, [filteredInvoices]);

  // Generate year options for filtering
  const generateYearOptions = (): string[] => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    
    // Add last 5 years + current year as options
    for (let i = 0; i < 5; i++) {
      years.push((currentYear - i).toString());
    }
    
    // Add years from invoices
    filteredInvoices.forEach(invoice => {
      const year = new Date(invoice.date).getFullYear().toString();
      if (!years.includes(year)) {
        years.push(year);
      }
    });
    
    return years.sort((a, b) => parseInt(b) - parseInt(a));
  };

  // Generate month options for filtering based on selected year
  const generateMonthOptions = (
    selectedYear: string,
    invoices: Invoice[]
  ): { value: string; label: string }[] => {
    const months: { value: string; label: string }[] = [];
    const trackedMonths = new Set<string>();
    
    invoices.forEach(invoice => {
      const date = new Date(invoice.date);
      const invoiceYear = date.getFullYear().toString();
      
      if (invoiceYear === selectedYear) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const monthKey = `${selectedYear}-${month}`;
        
        if (!trackedMonths.has(monthKey)) {
          trackedMonths.add(monthKey);
          
          // Format month name
          const monthLabel = format(date, 'MMMM', { locale: fr });
          months.push({
            value: monthKey,
            label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
          });
        }
      }
    });
    
    // Sort by month number (descending)
    return months.sort((a, b) => {
      const monthA = parseInt(a.value.split('-')[1]);
      const monthB = parseInt(b.value.split('-')[1]);
      return monthB - monthA;
    });
  };

  return { 
    filteredInvoices, 
    groupInvoicesByYearAndMonth, 
    generateYearOptions, 
    generateMonthOptions 
  };
};

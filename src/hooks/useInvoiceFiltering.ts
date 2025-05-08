
import { useMemo } from "react";
import { Invoice, Patient } from "@/types";
import { format } from "date-fns";

export const useInvoiceFiltering = (
  invoices: Invoice[] | undefined,
  searchQuery: string,
  statusFilter: string,
  patientDataMap: Map<number, Patient>
) => {
  // Helper function to get patient name
  const getPatientName = (invoice: Invoice, patientDataMap: Map<number, Patient>) => {
    // First check if we have the patient in our map
    const patient = patientDataMap.get(invoice.patientId);
    if (patient) {
      return `${patient.firstName} ${patient.lastName}`;
    }

    // Then check if Patient is attached by API
    // @ts-ignore (Patient peut être attaché par API)
    if (invoice.Patient) {
      //@ts-ignore
      return `${invoice.Patient.firstName} ${invoice.Patient.lastName}`;
    }

    return `Patient #${invoice.patientId}`;
  };

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];

    return invoices.filter((invoice) => {
      // Get the patient name
      const patientName = getPatientName(invoice, patientDataMap);

      const matchesQuery =
        patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.id.toString().includes(searchQuery);

      const matchesStatus =
        statusFilter === "ALL" || invoice.paymentStatus === statusFilter;
        
      return matchesQuery && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter, patientDataMap]);

  // Group invoices by year and month
  const groupInvoicesByYearAndMonth = useMemo(() => {
    if (!filteredInvoices) return {};

    const groupedInvoices: Record<string, Record<string, Invoice[]>> = {};

    filteredInvoices.forEach(invoice => {
      const date = new Date(invoice.date);
      const year = date.getFullYear().toString();
      const monthKey = format(date, 'yyyy-MM');
      
      if (!groupedInvoices[year]) {
        groupedInvoices[year] = {};
      }
      
      if (!groupedInvoices[year][monthKey]) {
        groupedInvoices[year][monthKey] = [];
      }
      
      groupedInvoices[year][monthKey].push(invoice);
    });

    // Sort invoices in each month
    Object.keys(groupedInvoices).forEach(year => {
      Object.keys(groupedInvoices[year]).forEach(monthKey => {
        groupedInvoices[year][monthKey].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });
    });

    return groupedInvoices;
  }, [filteredInvoices]);

  // Generate years for filter options
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];

    // Generate the 5 latest years
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }

    return years;
  };

  // Generate months for filter options
  const generateMonthOptions = (selectedYear: string, filteredInvoices: Invoice[]) => {
    if (!filteredInvoices || filteredInvoices.length === 0) return [];
    
    const monthsInYear = new Set<string>();
    
    filteredInvoices.forEach(invoice => {
      const date = new Date(invoice.date);
      const invoiceYear = date.getFullYear().toString();
      
      if (invoiceYear === selectedYear) {
        const monthKey = format(date, 'yyyy-MM');
        monthsInYear.add(monthKey);
      }
    });
    
    return Array.from(monthsInYear).sort((a, b) => b.localeCompare(a)); // Sort in descending order
  };

  return {
    filteredInvoices,
    groupInvoicesByYearAndMonth,
    generateYearOptions,
    generateMonthOptions
  };
};

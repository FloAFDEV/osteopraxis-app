import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { Patient } from '@/types';
import { InvoiceForm } from '@/components/invoice-form';
import { FancyLoader } from '@/components/ui/fancy-loader';

const NewInvoicePage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (patientId) {
      loadPatientDetails(patientId);
    } else {
      toast.error("Patient ID is missing.");
      setIsLoading(false);
    }
  }, [patientId]);

  // Fix the type error where string is passed instead of number
  const loadPatientDetails = async (patientId: string) => {
    if (!patientId) return;
    
    try {
      // Convert string patientId to number
      const patientIdNum = parseInt(patientId, 10);
      if (isNaN(patientIdNum)) {
        console.error("Invalid patient ID");
        return;
      }
      
      const patientData = await api.getPatientById(patientIdNum);
      if (patientData) {
        setPatient(patientData);
      }
    } catch (error) {
      console.error("Error loading patient details:", error);
      toast.error("Error loading patient details");
    }
  };

  const handleInvoiceCreated = () => {
    toast.success("Invoice created successfully!");
    navigate('/invoices');
  };

  if (isLoading) {
    return <FancyLoader message="Loading patient details..." />;
  }

  if (!patient) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-semibold mb-4">New Invoice</h2>
        <p>Patient not found or patient ID is missing.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">New Invoice for {patient.firstName} {patient.lastName}</h2>
      <InvoiceForm patient={patient} onCreate={handleInvoiceCreated} />
    </div>
  );
};

export default NewInvoicePage;

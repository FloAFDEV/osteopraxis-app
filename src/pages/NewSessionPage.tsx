
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { SessionForm } from '@/components/session/SessionForm';
import { Layout } from '@/components/ui/layout';
import { Patient } from '@/types';
import { toast } from 'sonner';

const NewSessionPage = () => {
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadPatient = async () => {
      if (patientIdParam) {
        try {
          setLoading(true);
          const patientData = await api.getPatientById(parseInt(patientIdParam, 10));
          setPatient(patientData);
        } catch (error) {
          console.error("Erreur lors du chargement du patient:", error);
          toast.error("Impossible de charger les données du patient");
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadPatient();
  }, [patientIdParam]);
  
  const handleCancel = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <SessionForm 
        patients={patient ? [patient] : []} 
        patient={patient}
        onCancel={handleCancel}
      />
    </Layout>
  );
};

export default NewSessionPage;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { SessionForm } from '@/components/session/SessionForm';
import { Layout } from '@/components/ui/layout';
import { Patient } from '@/types';
import { toast } from 'sonner';

const EditSessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!id) {
        toast.error("ID de session manquant");
        navigate("/sessions");
        return;
      }
      
      try {
        setLoading(true);
        const sessionData = await api.getAppointmentById(parseInt(id, 10));
        
        if (!sessionData) {
          toast.error("Session introuvable");
          navigate("/sessions");
          return;
        }
        
        // Récupérer les infos du patient
        const patientData = await api.getPatientById(sessionData.patientId);
        setPatient(patientData);
        
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionData();
  }, [id, navigate]);
  
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
      {patient && (
        <SessionForm 
          patient={patient}
          onCancel={handleCancel} 
        />
      )}
    </Layout>
  );
};

export default EditSessionPage;

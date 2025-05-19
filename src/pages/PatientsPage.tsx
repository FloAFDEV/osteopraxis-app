
import React from "react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { useQuery } from "@tanstack/react-query";

const PatientsPage = () => {
  // Utiliser useQuery pour obtenir refetch
  const { data: patients, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: api.getPatients
  });

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Patients</h1>
        
        <div className="grid gap-4">
          {patients?.map(patient => (
            <div key={patient.id} className="border p-4 rounded">
              {patient.firstName} {patient.lastName}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default PatientsPage;

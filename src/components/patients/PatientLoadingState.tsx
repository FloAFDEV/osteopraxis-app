
import React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PatientLoadingStateProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

export function PatientLoadingState({ loading, error, children }: PatientLoadingStateProps) {
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-full">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-xl font-semibold text-center">
            {error || "Patient non trouvé"}
          </p>
          <Button variant="outline" asChild className="mt-4">
            <Link to="/patients">Retour à la liste des patients</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}


import React from "react";
import { Patient } from "@/types";
import { PatientFormValues } from "@/components/patient-form/types";
import { ClipboardList, Stethoscope, Syringe, CheckCircle2, StickyNote } from "lucide-react";

interface ClinicalSectionsProps {
  patient: Patient;
  onPatientUpdated: (updatedData: PatientFormValues) => Promise<void>;
  isLoading?: boolean;
}

export const ClinicalSections: React.FC<ClinicalSectionsProps> = ({
  patient,
  onPatientUpdated,
  isLoading = false
}) => {
  const sections = [
    {
      field: patient.diagnosis,
      title: "Diagnostic",
      icon: <ClipboardList className="h-4 w-4" />
    },
    {
      field: patient.medical_examination,
      title: "Examen médical",
      icon: <Stethoscope className="h-4 w-4" />
    },
    {
      field: patient.treatment_plan,
      title: "Plan de traitement",
      icon: <Syringe className="h-4 w-4" />
    },
    {
      field: patient.consultation_conclusion,
      title: "Conclusion de consultation",
      icon: <CheckCircle2 className="h-4 w-4" />
    }
  ];

  const filtered = sections.filter(
    section => section.field && section.field.trim() !== ""
  );
  
  if (filtered.length === 0) return null;
  
  return (
    <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50/70 dark:bg-blue-950/30 mb-4 space-y-4">
      <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
        <StickyNote className="h-5 w-5 text-blue-900" />
        Compte-rendu clinique
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(section => (
          <div key={section.title} className="bg-white dark:bg-slate-800 rounded p-3 border border-muted-200 dark:border-muted-700 flex flex-col shadow-sm">
            <span className="flex items-center gap-2 font-medium text-sm mb-1">
              {section.icon}
              {section.title}
            </span>
            <span className="text-gray-700 dark:text-gray-100">{section.field}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


import React from "react";
import { Patient } from "@/types";
import { PatientFormValues } from "@/components/patient-form/types";

interface GroupedMedicalSectionsProps {
  patient: Patient;
  onPatientUpdated: (updatedData: PatientFormValues) => Promise<void>;
  isLoading?: boolean;
}

export const GroupedMedicalSections: React.FC<GroupedMedicalSectionsProps> = ({
  patient,
  onPatientUpdated,
  isLoading = false
}) => {
  const groupedSections = [
    {
      group: "Antécédents médicaux",
      icon: <span>🏥</span>,
      items: [
        { label: "Médecin traitant", value: patient.generalPractitioner },
        { label: "Antécédents chirurgicaux", value: patient.surgicalHistory },
        { label: "Antécédents traumatiques", value: patient.traumaHistory },
        { label: "Antécédents rhumatologiques", value: patient.rheumatologicalHistory },
        { label: "Traitement en cours", value: patient.currentTreatment },
      ]
    }
  ];

  return (
    <>
      {groupedSections.map(g =>
        g.items.some(item => item.value && item.value.trim() !== "") && (
          <div key={g.group} className="mb-4">
            <div className="flex items-center gap-2 mb-2 text-lg font-semibold text-gray-700 dark:text-gray-100">
              {g.icon} {g.group}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {g.items.map(
                (item) =>
                  item.value &&
                  item.value.trim() !== "" && (
                    <div
                      key={item.label}
                      className="bg-white dark:bg-slate-800 rounded p-3 border border-muted-200 dark:border-muted-700 flex flex-col shadow-sm"
                    >
                      <span className="font-medium text-sm mb-1">{item.label}</span>
                      <span className="text-gray-700 dark:text-gray-100">{item.value}</span>
                    </div>
                  )
              )}
            </div>
            {g !== groupedSections[groupedSections.length - 1] && (
              <hr className="my-6 border-t border-dashed border-gray-300 dark:border-gray-700" />
            )}
          </div>
        )
      )}
    </>
  );
};

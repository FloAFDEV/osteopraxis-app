
import { Patient } from "@/types";
import { format } from "date-fns";
import { getPatientDisplayName } from "@/hooks/usePatientDisplayInfo";

export const StyledPatientName = ({
  patient,
  patientName,
}: {
  patient?: Patient;
  patientName?: string;
}) => {
  if (patient) {
    return (
      <div className="pt-1">
        <div
          className={`flex items-center gap-1 text-lg font-medium ${
            patient.gender === "Femme"
              ? "text-pink-600 dark:text-pink-300"
              : patient.gender === "Homme"
              ? "text-blue-600 dark:text-blue-300"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <span>
            {patient.gender === "Femme"
              ? "♀️"
              : patient.gender === "Homme"
              ? "♂️"
              : "⚧️"}
          </span>
          <span>
            {getPatientDisplayName(patient)}
          </span>
        </div>
        {patient.birthDate && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Né(e) le {format(new Date(patient.birthDate), "dd/MM/yyyy")}
          </div>
        )}
        {patient.address && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {patient.address}
          </div>
        )}
      </div>
    );
  } else if (patientName) {
    return (
      <div className="pt-1">
        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
          {patientName}
        </div>
      </div>
    );
  }
  return null;
};


import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";
import { SmokingHabitsSection } from "./SmokingHabitsSection";
import { GeneralHealthSection } from "./GeneralHealthSection";

interface AdditionalFieldsTabProps {
  form: UseFormReturn<PatientFormValues>;
  isChild: boolean;
}

export const AdditionalFieldsTab = ({
  form,
  isChild,
}: AdditionalFieldsTabProps) => (
  <div className="space-y-6">
    <SmokingHabitsSection form={form} />
    <GeneralHealthSection form={form} isChild={isChild} />
  </div>
);

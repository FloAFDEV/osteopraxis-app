
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";
import { SmokingHabitsSection } from "./SmokingHabitsSection";
import { GeneralHealthSection } from "./GeneralHealthSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdditionalFieldsTabProps {
  form: UseFormReturn<PatientFormValues>;
  isChild: boolean;
}

export const AdditionalFieldsTab = ({
  form,
  isChild,
}: AdditionalFieldsTabProps) => (
  <div className="flex flex-col gap-6 md:gap-8 p-0 md:p-2">
    <Card className="bg-muted/30 border rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg font-semibold text-primary">
          Habitudes tabagiques
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <SmokingHabitsSection form={form} />
      </CardContent>
    </Card>
    <Card className="bg-muted/40 border rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg font-semibold text-primary">
          Santé générale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <GeneralHealthSection form={form} isChild={isChild} />
      </CardContent>
    </Card>
  </div>
);

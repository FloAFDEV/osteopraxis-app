import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";
import { WeightHeightBmiFields } from "./WeightHeightBmiFields";

interface WeightTrackingTabProps {
    form: UseFormReturn<PatientFormValues>;
}

export const WeightTrackingTab = ({ form }: WeightTrackingTabProps) => {
    return (
        <Card>
            <CardContent className="space-y-4 mt-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-primary">Suivi anthropométrique</h3>
                    <WeightHeightBmiFields form={form} />
                </div>
            </CardContent>
        </Card>
    );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";

interface DemographicsCardProps {
  data: DashboardData;
}

export function DemographicsCard({ data }: DemographicsCardProps) {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Démographie des patients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hommes</span>
              <span className="font-medium">{data.maleCount} ({Math.round(data.maleCount / data.totalPatients * 100)}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Femmes</span>
              <span className="font-medium">{data.femaleCount} ({Math.round(data.femaleCount / data.totalPatients * 100)}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Âge moyen (tout)</span>
              <span className="font-medium">{data.averageAge} ans</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Âge moyen (hommes)</span>
              <span className="font-medium">{data.averageAgeMale} ans</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Âge moyen (femmes)</span>
              <span className="font-medium">{data.averageAgeFemale} ans</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoSaveIndicator } from "./AutoSaveIndicator";

interface CompteRenduSectionProps {
  value: string;
  onChange: (value: string) => void;
  isAutoSaving: boolean;
  lastSaved: Date | null;
}

export function CompteRenduSection({ 
  value, 
  onChange, 
  isAutoSaving,
  lastSaved
}: CompteRenduSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Compte rendu de séance</CardTitle>
          <AutoSaveIndicator isSaving={isAutoSaving} lastSaved={lastSaved} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="compte-rendu">Compte rendu</Label>
          <Textarea
            id="compte-rendu"
            placeholder="Décrivez les soins réalisés, observations et recommandations..."
            className="min-h-[200px] resize-y"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

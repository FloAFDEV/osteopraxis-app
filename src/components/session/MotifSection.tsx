
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoSaveIndicator } from "./AutoSaveIndicator";

interface MotifSectionProps {
  value: string;
  onChange: (value: string) => void;
  isAutoSaving: boolean;
  lastSaved: Date | null;
}

export function MotifSection({ 
  value, 
  onChange, 
  isAutoSaving,
  lastSaved
}: MotifSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Motif de la séance</CardTitle>
          <AutoSaveIndicator isSaving={isAutoSaving} lastSaved={lastSaved} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="motif">Motif principal</Label>
          <Textarea
            id="motif"
            placeholder="Décrivez le motif principal de cette séance..."
            className="min-h-[120px] resize-y"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

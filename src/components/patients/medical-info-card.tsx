
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MedicalInfoCardProps {
  title: string;
  items: {
    label: string;
    value: string | null | undefined;
    showSeparatorAfter?: boolean;
  }[];
}

export function MedicalInfoCard({ title, items }: MedicalInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <dl className="space-y-4">
          {items.map(({ label, value, showSeparatorAfter }, index) => (
            <div key={index}>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                <dd className="mt-1">{value || "Non spécifié"}</dd>
              </div>
              {showSeparatorAfter && <Separator className="my-4" />}
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

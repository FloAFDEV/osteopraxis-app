import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Copy } from 'lucide-react';

interface ConsultationTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  content: any;
}

interface ConsultationTemplateSelectorProps {
  onSelectTemplate: (template: ConsultationTemplate) => void;
  templates?: ConsultationTemplate[];
}

export const ConsultationTemplateSelector = ({ 
  onSelectTemplate, 
  templates = [] 
}: ConsultationTemplateSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTemplates: ConsultationTemplate[] = [
    {
      id: 1,
      name: 'Consultation générale',
      description: 'Template pour une consultation générale d\'ostéopathie',
      category: 'general',
      content: {
        sections: {
          symptoms: {
            title: 'Symptômes',
            fields: ['Douleur principale', 'Localisation', 'Intensité (1-10)', 'Déclencheurs']
          },
          examination: {
            title: 'Examen clinique',
            fields: ['Observation', 'Palpation', 'Tests de mobilité', 'Tests fonctionnels']
          },
          treatment: {
            title: 'Traitement',
            fields: ['Techniques utilisées', 'Zones traitées', 'Conseils donnés']
          }
        }
      }
    },
    {
      id: 2,
      name: 'Consultation pédiatrique',
      description: 'Template spécialisé pour les consultations d\'enfants',
      category: 'pediatric',
      content: {
        sections: {
          development: {
            title: 'Développement',
            fields: ['Développement moteur', 'Développement cognitif', 'Troubles du sommeil']
          },
          examination: {
            title: 'Examen pédiatrique',
            fields: ['Tonus musculaire', 'Réflexes', 'Mobilité articulaire']
          }
        }
      }
    }
  ];

  const allTemplates = [...defaultTemplates, ...templates];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'pediatric': return 'bg-green-100 text-green-800';
      case 'sport': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Utiliser un template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choisir un template de consultation</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allTemplates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(template.content.sections || {}).map(([key, section]: [string, any]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium">{section.title}:</span>
                      <span className="text-muted-foreground ml-1">
                        {section.fields.length} champs
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => {
                      onSelectTemplate(template);
                      setIsOpen(false);
                    }}
                    className="flex-1"
                  >
                    Utiliser ce template
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un nouveau template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import { supabase } from '@/integrations/supabase/client';
import { ConsultationTemplate, CreateConsultationTemplatePayload } from '@/types';

export class ConsultationTemplateService {
  
  async getTemplates(osteopathId: number): Promise<ConsultationTemplate[]> {
    const { data, error } = await supabase
      .from('consultation_templates')
      .select('*')
      .eq('osteopath_id', osteopathId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching consultation templates:', error);
      throw error;
    }

    return data?.map(this.mapToConsultationTemplate) || [];
  }

  async getTemplateById(id: number): Promise<ConsultationTemplate | null> {
    const { data, error } = await supabase
      .from('consultation_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching consultation template:', error);
      throw error;
    }

    return data ? this.mapToConsultationTemplate(data) : null;
  }

  async createTemplate(payload: CreateConsultationTemplatePayload): Promise<ConsultationTemplate> {
    const { data, error } = await supabase
      .from('consultation_templates')
      .insert({
        name: payload.name,
        description: payload.description,
        category: payload.category,
        content: payload.content,
        is_active: payload.isActive ?? true,
        osteopath_id: payload.osteopathId,
        cabinet_id: payload.cabinetId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating consultation template:', error);
      throw error;
    }

    return this.mapToConsultationTemplate(data);
  }

  async updateTemplate(id: number, payload: Partial<CreateConsultationTemplatePayload>): Promise<ConsultationTemplate> {
    const { data, error } = await supabase
      .from('consultation_templates')
      .update({
        name: payload.name,
        description: payload.description,
        category: payload.category,
        content: payload.content,
        is_active: payload.isActive,
        cabinet_id: payload.cabinetId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating consultation template:', error);
      throw error;
    }

    return this.mapToConsultationTemplate(data);
  }

  async deleteTemplate(id: number): Promise<void> {
    const { error } = await supabase
      .from('consultation_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting consultation template:', error);
      throw error;
    }
  }

  async duplicateTemplate(id: number, newName: string): Promise<ConsultationTemplate> {
    const template = await this.getTemplateById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    return this.createTemplate({
      name: newName,
      description: template.description,
      category: template.category,
      content: template.content,
      osteopathId: template.osteopathId,
      cabinetId: template.cabinetId,
    });
  }

  getDefaultTemplates(): CreateConsultationTemplatePayload[] {
    return [
      {
        name: 'Consultation générale',
        description: 'Template pour une consultation générale d\'ostéopathie',
        category: 'general',
        content: {
          sections: {
            symptoms: {
              title: 'Symptômes',
              fields: ['Douleur principale', 'Localisation', 'Intensité (1-10)', 'Déclencheurs'],
              defaultValues: {
                'Intensité (1-10)': '5'
              }
            },
            examination: {
              title: 'Examen clinique',
              fields: ['Observation', 'Palpation', 'Tests de mobilité', 'Tests fonctionnels']
            },
            treatment: {
              title: 'Traitement',
              fields: ['Techniques utilisées', 'Zones traitées', 'Conseils donnés']
            },
            followUp: {
              title: 'Suivi',
              fields: ['Prochaine séance', 'Exercices à domicile', 'Observations']
            }
          }
        },
        osteopathId: 0, // Will be set by the caller
      },
      {
        name: 'Consultation pédiatrique',
        description: 'Template spécialisé pour les consultations d\'enfants',
        category: 'pediatric',
        content: {
          sections: {
            development: {
              title: 'Développement',
              fields: ['Développement moteur', 'Développement cognitif', 'Troubles du sommeil', 'Alimentation']
            },
            examination: {
              title: 'Examen pédiatrique',
              fields: ['Tonus musculaire', 'Réflexes', 'Mobilité articulaire', 'Cranien']
            },
            treatment: {
              title: 'Traitement adapté',
              fields: ['Techniques douces', 'Zones traitées', 'Réaction de l\'enfant']
            },
            advice: {
              title: 'Conseils aux parents',
              fields: ['Portage', 'Positionnement', 'Exercices', 'Surveillance']
            }
          }
        },
        osteopathId: 0,
      },
      {
        name: 'Consultation sportive',
        description: 'Template pour les consultations liées au sport',
        category: 'sport',
        content: {
          sections: {
            activity: {
              title: 'Activité sportive',
              fields: ['Sport pratiqué', 'Niveau', 'Fréquence', 'Objectifs']
            },
            injury: {
              title: 'Blessure/Gêne',
              fields: ['Type de blessure', 'Mécanisme', 'Symptômes', 'Impact sur performance']
            },
            examination: {
              title: 'Examen spécialisé',
              fields: ['Tests spécifiques au sport', 'Chaînes musculaires', 'Équilibre', 'Proprioception']
            },
            performance: {
              title: 'Optimisation performance',
              fields: ['Points d\'amélioration', 'Préparation physique', 'Récupération']
            }
          }
        },
        osteopathId: 0,
      }
    ];
  }

  private mapToConsultationTemplate(data: any): ConsultationTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      content: data.content,
      isActive: data.is_active,
      osteopathId: data.osteopath_id,
      cabinetId: data.cabinet_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const consultationTemplateService = new ConsultationTemplateService();
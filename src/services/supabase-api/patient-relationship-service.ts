import { supabase } from "@/integrations/supabase/client";
import { PatientRelationship, CreatePatientRelationshipPayload } from "@/types/patient-relationship";

// Détection du mode démo
function isDemoMode(): boolean {
	const localDemo = localStorage.getItem('isTemporaryDemo') === 'true';
	const sessionDemo = sessionStorage.getItem('isDemoMode') === 'true';
	return localDemo || sessionDemo;
}

// Stockage local pour les relations familiales en mode démo
const DEMO_RELATIONSHIPS_KEY = 'demo_patient_relationships';

function getDemoRelationships(): PatientRelationship[] {
	if (!isDemoMode()) return [];
	
	try {
		const stored = localStorage.getItem(DEMO_RELATIONSHIPS_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.debug('Erreur lecture relations démo:', error);
		return [];
	}
}

function saveDemoRelationships(relationships: PatientRelationship[]): void {
	if (!isDemoMode()) return;
	
	try {
		localStorage.setItem(DEMO_RELATIONSHIPS_KEY, JSON.stringify(relationships));
	} catch (error) {
		console.debug('Erreur sauvegarde relations démo:', error);
	}
}

function generateDemoId(): number {
	return Date.now() + Math.floor(Math.random() * 1000);
}

export const patientRelationshipService = {
  // Récupérer toutes les relations d'un patient
  async getPatientRelationships(patientId: number): Promise<PatientRelationship[]> {
    if (isDemoMode()) {
      console.debug('🎭 Mode démo: Récupération relations depuis stockage local');
      const relationships = getDemoRelationships();
      return relationships.filter(rel => rel.patient_id === patientId);
    }

    const { data, error } = await supabase
      .from('patient_relationships')
      .select(`
        id,
        patient_id,
        related_patient_id,
        relationship_type,
        relationship_notes,
        created_at,
        updated_at
      `)
      .eq('patient_id', patientId);

    if (error) {
      console.error('Erreur lors de la récupération des relations:', error);
      throw new Error('Impossible de récupérer les relations familiales');
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Pour chaque relation, récupérer les données du patient lié
    const result: PatientRelationship[] = [];
    
    for (const relation of data) {
      try {
        const { data: patientData, error: patientError } = await supabase
          .from('Patient')
          .select('id, firstName, lastName, birthDate')
          .eq('id', relation.related_patient_id)
          .single();

        if (!patientError && patientData) {
          result.push({
            ...relation,
            related_patient: patientData
          });
        }
      } catch (err) {
        console.warn(`Impossible de charger les données du patient ${relation.related_patient_id}:`, err);
      }
    }

    return result;
  },

  // Créer une nouvelle relation
  async createPatientRelationship(payload: CreatePatientRelationshipPayload): Promise<PatientRelationship> {
    if (isDemoMode()) {
      console.debug('🎭 Mode démo: Création relation en local');
      const relationships = getDemoRelationships();
      const newRelationship: PatientRelationship = {
        ...payload,
        id: generateDemoId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        related_patient: {
          id: payload.related_patient_id,
          firstName: 'Patient',
          lastName: 'Démo',
          birthDate: '1990-01-01'
        }
      };
      
      relationships.push(newRelationship);
      saveDemoRelationships(relationships);
      return newRelationship;
    }

    const { data, error } = await supabase
      .from('patient_relationships')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la relation:', error);
      throw new Error('Impossible de créer la relation familiale');
    }

    // Récupérer les données du patient lié
    const { data: patientData, error: patientError } = await supabase
      .from('Patient')
      .select('id, firstName, lastName, birthDate')
      .eq('id', data.related_patient_id)
      .single();

    if (patientError || !patientData) {
      throw new Error('Impossible de récupérer les données du patient lié');
    }

    return {
      ...data,
      related_patient: patientData
    };
  },

  // Mettre à jour une relation
  async updatePatientRelationship(
    relationshipId: number, 
    updates: Partial<Omit<CreatePatientRelationshipPayload, 'patient_id' | 'related_patient_id'>>
  ): Promise<PatientRelationship> {
    if (isDemoMode()) {
      console.debug('🎭 Mode démo: Mise à jour relation en local');
      const relationships = getDemoRelationships();
      const index = relationships.findIndex(rel => rel.id === relationshipId);
      
      if (index === -1) {
        throw new Error('Relation non trouvée');
      }
      
      relationships[index] = {
        ...relationships[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      saveDemoRelationships(relationships);
      return relationships[index];
    }

    const { data, error } = await supabase
      .from('patient_relationships')
      .update(updates)
      .eq('id', relationshipId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la relation:', error);
      throw new Error('Impossible de mettre à jour la relation familiale');
    }

    // Récupérer les données du patient lié
    const { data: patientData, error: patientError } = await supabase
      .from('Patient')
      .select('id, firstName, lastName, birthDate')
      .eq('id', data.related_patient_id)
      .single();

    if (patientError || !patientData) {
      throw new Error('Impossible de récupérer les données du patient lié');
    }

    return {
      ...data,
      related_patient: patientData
    };
  },

  // Supprimer une relation
  async deletePatientRelationship(relationshipId: number): Promise<void> {
    if (isDemoMode()) {
      console.debug('🎭 Mode démo: Suppression relation en local');
      const relationships = getDemoRelationships();
      const filtered = relationships.filter(rel => rel.id !== relationshipId);
      saveDemoRelationships(filtered);
      return;
    }

    const { error } = await supabase
      .from('patient_relationships')
      .delete()
      .eq('id', relationshipId);

    if (error) {
      console.error('Erreur lors de la suppression de la relation:', error);
      throw new Error('Impossible de supprimer la relation familiale');
    }
  },

  // Récupérer toutes les relations bidirectionnelles d'un patient (en tant que patient_id OU related_patient_id)
  async getAllPatientRelationships(patientId: number): Promise<PatientRelationship[]> {
    if (isDemoMode()) {
      console.debug('🎭 Mode démo: Récupération toutes relations depuis stockage local');
      const relationships = getDemoRelationships();
      return relationships.filter(rel => 
        rel.patient_id === patientId || rel.related_patient_id === patientId
      );
    }

    // Relations directes
    const directRelations = await this.getPatientRelationships(patientId);
    
    // Relations inverses (où ce patient est le patient lié)
    const { data: inverseData, error: inverseError } = await supabase
      .from('patient_relationships')
      .select(`
        id,
        patient_id,
        related_patient_id,
        relationship_type,
        relationship_notes,
        created_at,
        updated_at
      `)
      .eq('related_patient_id', patientId);

    if (inverseError) {
      console.error('Erreur lors de la récupération des relations inverses:', inverseError);
      return directRelations; // Retourner au moins les relations directes
    }

    const inverseRelations: PatientRelationship[] = [];
    
    if (inverseData && inverseData.length > 0) {
      for (const relation of inverseData) {
        try {
          const { data: patientData, error: patientError } = await supabase
            .from('Patient')
            .select('id, firstName, lastName, birthDate')
            .eq('id', relation.patient_id)
            .single();

          if (!patientError && patientData) {
            inverseRelations.push({
              ...relation,
              related_patient: patientData
            });
          }
        } catch (err) {
          console.warn(`Impossible de charger les données du patient ${relation.patient_id}:`, err);
        }
      }
    }

    return [...directRelations, ...inverseRelations];
  }
};

export default patientRelationshipService;
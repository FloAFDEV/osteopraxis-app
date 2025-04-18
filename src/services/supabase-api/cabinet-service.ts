
// Specific fix for the cabinet-service.ts file where we need to ensure the right type is being used
import { checkAuth, supabase } from "./utils";
import { Cabinet } from "@/types";

// Helper function to adapt Cabinet data from Supabase
const adaptCabinetFromSupabase = (data: any): Cabinet => ({
  id: data.id,
  name: data.name,
  address: data.address,
  phone: data.phone,
  email: data.email,
  logoUrl: data.logoUrl,
  imageUrl: data.imageUrl,
  osteopathId: data.osteopathId,
  createdAt: data.createdAt || data.created_at,
  updatedAt: data.updatedAt || data.updated_at
});

export const supabaseCabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    try {
      // Check authentication before proceeding
      const session = await checkAuth();
      console.log("Fetching cabinets with authenticated user:", session.user.id);

      const { data, error } = await supabase
        .from('Cabinet')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching cabinets:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} cabinets`);
      return (data || []).map(adaptCabinetFromSupabase);
    } catch (error) {
      console.error('Error in getCabinets:', error);
      throw error;
    }
  },

  async getCabinetById(id: number): Promise<Cabinet | null> {
    try {
      const { data, error } = await supabase
        .from('Cabinet')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching cabinet by id:', error);
        throw error;
      }

      return data ? adaptCabinetFromSupabase(data) : null;
    } catch (error) {
      console.error('Error in getCabinetById:', error);
      throw error;
    }
  },

  // Renamed from getCabinetByOsteopathId to getCabinetsByOsteopathId for consistency
  async getCabinetsByOsteopathId(osteopathId: number): Promise<Cabinet[]> {
    try {
      const { data, error } = await supabase
        .from('Cabinet')
        .select('*')
        .eq('osteopathId', osteopathId);

      if (error) {
        console.error('Error fetching cabinets by osteopathId:', error);
        throw error;
      }

      return (data || []).map(adaptCabinetFromSupabase);
    } catch (error) {
      console.error('Error in getCabinetsByOsteopathId:', error);
      throw error;
    }
  },
  
  // Adding getCabinetsByUserId method to fetch cabinets related to a user
  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
    try {
      // D'abord vérifier si l'utilisateur a un osteopathId directement dans son profil
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('osteopathId')
        .eq('id', userId)
        .maybeSingle();
        
      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user:', userError);
        throw userError;
      }
      
      if (userData && userData.osteopathId) {
        console.log(`User has direct osteopathId: ${userData.osteopathId}, using it to fetch cabinets`);
        return this.getCabinetsByOsteopathId(userData.osteopathId);
      }
      
      // Sinon, chercher l'osteopath associé
      const { data: osteopathData, error: osteopathError } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('userId', userId)
        .maybeSingle();

      // If no osteopath found, create one automatically
      if (!osteopathData) {
        console.log('No osteopath found for userId:', userId);
        console.log('Creating a default osteopath profile...');
        
        const now = new Date().toISOString();
        const { data: userData } = await supabase
          .from('User')
          .select('first_name, last_name')
          .eq('id', userId)
          .maybeSingle();
          
        const name = userData ? 
          `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : 
          'Nouvel Ostéopathe';
          
        // Create a new osteopath record
        const { data: newOsteopath, error: createError } = await supabase
          .from('Osteopath')
          .insert({
            name: name || 'Nouvel Ostéopathe',
            userId: userId,
            createdAt: now,
            updatedAt: now,
            professional_title: 'Ostéopathe D.O.',
            ape_code: '8690F'
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating osteopath profile:', createError);
          throw createError;
        }
        
        console.log('Created default osteopath profile:', newOsteopath);
        
        // Create a default cabinet for the new osteopath
        const { data: newCabinet, error: cabinetError } = await supabase
          .from('Cabinet')
          .insert({
            name: 'Mon Cabinet',
            address: 'Adresse à définir',
            osteopathId: newOsteopath.id,
            createdAt: now,
            updatedAt: now
          })
          .select()
          .single();
          
        if (cabinetError) {
          console.error('Error creating default cabinet:', cabinetError);
          // Continue even if cabinet creation fails
        } else {
          console.log('Created default cabinet:', newCabinet);
          return [adaptCabinetFromSupabase(newCabinet)];
        }
        
        // Update the User record with the new osteopathId
        const { error: updateUserError } = await supabase
          .from('User')
          .update({ osteopathId: newOsteopath.id })
          .eq('id', userId);
          
        if (updateUserError) {
          console.error('Error updating user with osteopathId:', updateUserError);
          // Continue anyway
        }
        
        // Return empty array if cabinet creation failed
        return [];
      }
      
      if (osteopathError && osteopathError.code !== 'PGRST116') {
        console.error('Error fetching osteopath by userId:', osteopathError);
        throw osteopathError;
      }
      
      // Now get cabinets for this osteopath
      return await this.getCabinetsByOsteopathId(osteopathData.id);
    } catch (error) {
      console.error('Error in getCabinetsByUserId:', error);
      throw error;
    }
  },

  async createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    try {
      const now = new Date().toISOString();
      
      const cabinetData = {
        ...cabinet,
        createdAt: now,
        updatedAt: now
      };
      
      const { data, error } = await supabase
        .from('Cabinet')
        .insert(cabinetData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating cabinet:', error);
        throw error;
      }
      
      return adaptCabinetFromSupabase(data);
    } catch (error) {
      console.error('Error in createCabinet:', error);
      throw error;
    }
  },

  async updateCabinet(id: number, cabinet: Partial<Cabinet>): Promise<Cabinet> {
    try {
      const now = new Date().toISOString();
      
      const cabinetData = {
        ...cabinet,
        updatedAt: now
      };

      const { data, error } = await supabase
        .from('Cabinet')
        .update(cabinetData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating cabinet:', error);
        throw error;
      }

      return adaptCabinetFromSupabase(data);
    } catch (error) {
      console.error('Error in updateCabinet:', error);
      throw error;
    }
  },

  async deleteCabinet(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('Cabinet')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting cabinet:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteCabinet:', error);
      throw error;
    }
  }
};

export default supabaseCabinetService;

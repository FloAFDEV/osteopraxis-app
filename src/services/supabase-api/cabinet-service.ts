
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
      // First get the osteopath ID for this user
      const { data: osteopathData, error: osteopathError } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('userId', userId)
        .maybeSingle();

      if (osteopathError) {
        console.error('Error fetching osteopath by userId:', osteopathError);
        throw osteopathError;
      }

      // If no osteopath found, return empty array
      if (!osteopathData) {
        console.log('No osteopath found for userId:', userId);
        return [];
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

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

  async getCabinetByOsteopathId(osteopathId: number): Promise<Cabinet | null> {
    try {
      const { data, error } = await supabase
        .from('Cabinet')
        .select('*')
        .eq('osteopathId', osteopathId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching cabinet by osteopathId:', error);
        throw error;
      }

      return data ? adaptCabinetFromSupabase(data) : null;
    } catch (error) {
      console.error('Error in getCabinetByOsteopathId:', error);
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

  async deleteCabinet(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Cabinet')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting cabinet:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCabinet:', error);
      throw error;
    }
  }
};

export default supabaseCabinetService;

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
  
  async getCabinetsByUserId(userId: string): Promise<Cabinet[]> {
    try {
      // First check if the user has an osteopathId directly in their profile
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
      
      // Otherwise, look for the associated osteopath
      const { data: osteopathData, error: osteopathError } = await supabase
        .from('Osteopath')
        .select('id')
        .eq('userId', userId)
        .maybeSingle();

      // If no osteopath found, use the edge function to create one
      if (!osteopathData) {
        console.log('No osteopath found for userId:', userId);
        console.log('Trying to create profile using edge function...');
        
        try {
          // Get the current session for the access token
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData || !sessionData.session) {
            throw new Error("No active session");
          }
          
          console.log("Calling edge function completer-profil");
          const response = await fetch("https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/completer-profil", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${sessionData.session.access_token}`
            },
            body: JSON.stringify({
              osteopathData: {
                name: "Nouvel Ostéopathe",
                professional_title: "Ostéopathe D.O.",
                ape_code: "8690F"
              }
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Edge function error:", errorText);
            throw new Error(`Edge function error: ${errorText}`);
          }
          
          const result = await response.json();
          console.log("Edge function result:", result);
          
          if (result && result.osteopath && result.osteopath.id) {
            // Now retrieve cabinets for this new osteopath
            return await this.getCabinetsByOsteopathId(result.osteopath.id);
          } else {
            throw new Error("Invalid edge function response");
          }
        } catch (edgeError) {
          console.error("Error using edge function:", edgeError);
          throw edgeError;
        }
      }
      
      if (osteopathError && osteopathError.code !== 'PGRST116') {
        console.error('Error fetching osteopath by userId:', osteopathError);
        throw osteopathError;
      }
      
      // Now get cabinets for this osteopath
      if (osteopathData && osteopathData.id) {
        return await this.getCabinetsByOsteopathId(osteopathData.id);
      }
      
      return [];
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

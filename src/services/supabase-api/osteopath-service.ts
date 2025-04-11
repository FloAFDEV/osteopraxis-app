
import { Osteopath } from "@/types";
import { supabase, typedData, checkAuth } from "./utils";

export const supabaseOsteopathService = {
  async getOsteopaths(): Promise<Osteopath[]> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*");
      
    if (error) throw new Error(error.message);
    
    return typedData<Osteopath[]>(data);
  },

  async getOsteopathById(id: number): Promise<Osteopath | undefined> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("id", id)
      .maybeSingle();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data ? typedData<Osteopath>(data) : undefined;
  },
  
  async getOsteopathByUserId(userId: string): Promise<Osteopath | undefined> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("userId", userId)
      .maybeSingle();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data ? typedData<Osteopath>(data) : undefined;
  },
  
  async updateOsteopath(id: number, osteopathData: Partial<Omit<Osteopath, 'id' | 'createdAt'>>): Promise<Osteopath> {
    // Check authentication before proceeding
    await checkAuth();

    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("Osteopath")
      .update({
        ...osteopathData,
        updatedAt: now
      })
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return typedData<Osteopath>(data);
  },
  
  async createOsteopath(osteopathData: Omit<Osteopath, 'id' | 'createdAt' | 'updatedAt'>): Promise<Osteopath> {
    // Check authentication before proceeding
    const session = await checkAuth();
    console.log("Creating osteopath with authenticated session:", session.user.id);

    const now = new Date().toISOString();
    
    try {
      const { data, error } = await supabase
        .from("Osteopath")
        .insert({
          ...osteopathData,
          createdAt: now,
          updatedAt: now
        })
        .select()
        .single();
        
      if (error) {
        console.error("Supabase createOsteopath error details:", error);
        throw new Error(error.message);
      }
      
      return typedData<Osteopath>(data);
    } catch (error: any) {
      console.error("Supabase createOsteopath exception:", error);
      throw error;
    }
  }
};

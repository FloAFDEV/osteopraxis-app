
import { Osteopath } from "@/types";
import { supabase, typedData } from "./utils";

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
    // Make sure user is authenticated before proceeding
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error("Authentication required");
    }

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
    // Make sure user is authenticated before proceeding
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error("Authentication required");
    }

    const now = new Date().toISOString();
    
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
      console.error("Supabase createOsteopath error:", error);
      throw new Error(error.message);
    }
    
    return typedData<Osteopath>(data);
  }
};

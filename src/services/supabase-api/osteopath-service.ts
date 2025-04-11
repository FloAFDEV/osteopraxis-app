
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
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return typedData<Osteopath>(data);
  },
  
  async getOsteopathByUserId(userId: string): Promise<Osteopath | undefined> {
    const { data, error } = await supabase
      .from("Osteopath")
      .select("*")
      .eq("userId", userId)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return typedData<Osteopath>(data);
  },
  
  async updateOsteopath(id: number, osteopathData: Partial<Omit<Osteopath, 'id' | 'createdAt'>>): Promise<Osteopath> {
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
      
    if (error) throw new Error(error.message);
    
    return typedData<Osteopath>(data);
  }
};

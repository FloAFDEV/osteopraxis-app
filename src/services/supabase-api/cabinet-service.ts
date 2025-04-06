
import { Cabinet } from "@/types";
import { supabase } from "./utils";

export const supabaseCabinetService = {
  async getCabinets(): Promise<Cabinet[]> {
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*");
      
    if (error) throw new Error(error.message);
    
    return data;
  },

  async getCabinetById(id: number): Promise<Cabinet | undefined> {
    const { data, error } = await supabase
      .from("Cabinet")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      throw new Error(error.message);
    }
    
    return data;
  },

  async updateCabinet(id: number, cabinetData: Partial<Cabinet>): Promise<Cabinet | undefined> {
    const { data, error } = await supabase
      .from("Cabinet")
      .update({
        ...cabinetData,
        updatedAt: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return data;
  }
};

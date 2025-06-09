
import { Quote, CreateQuoteData, UpdateQuoteData } from "@/types";
import { USE_SUPABASE } from "./config";
import { supabaseQuoteService } from "../supabase-api/quote-service";

export const quoteService = {
  async getQuotes(): Promise<Quote[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseQuoteService.getQuotes();
      } catch (error) {
        console.error("Erreur Supabase getQuotes:", error);
        return [];
      }
    }
    
    // Mock implementation
    return [];
  },

  async getQuoteById(id: number): Promise<Quote | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseQuoteService.getQuoteById(id) || undefined;
      } catch (error) {
        console.error("Erreur Supabase getQuoteById:", error);
        return undefined;
      }
    }
    
    // Mock implementation
    return undefined;
  },

  async getQuotesByPatientId(patientId: number): Promise<Quote[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseQuoteService.getQuotesByPatientId(patientId);
      } catch (error) {
        console.error("Erreur Supabase getQuotesByPatientId:", error);
        return [];
      }
    }
    
    // Mock implementation
    return [];
  },

  async createQuote(quoteData: CreateQuoteData): Promise<Quote> {
    if (USE_SUPABASE) {
      try {
        return await supabaseQuoteService.createQuote(quoteData);
      } catch (error) {
        console.error("Erreur Supabase createQuote:", error);
        throw error;
      }
    }
    
    // Mock implementation
    return {
      id: Math.floor(Math.random() * 1000),
      ...quoteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Quote;
  },

  async updateQuote(id: number, quoteData: UpdateQuoteData): Promise<Quote | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseQuoteService.updateQuote(id, quoteData);
      } catch (error) {
        console.error("Erreur Supabase updateQuote:", error);
        return undefined;
      }
    }
    
    // Mock implementation
    return { 
      id, 
      ...quoteData 
    } as Quote;
  },

  async deleteQuote(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        const result = await supabaseQuoteService.deleteQuote(id);
        return !result.error;
      } catch (error) {
        console.error("Erreur Supabase deleteQuote:", error);
        return false;
      }
    }
    
    // Mock implementation
    return true;
  },

  async sendQuote(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        return await supabaseQuoteService.sendQuote(id);
      } catch (error) {
        console.error("Erreur Supabase sendQuote:", error);
        return false;
      }
    }
    
    // Mock implementation
    return true;
  }
};

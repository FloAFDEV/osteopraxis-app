
import { Quote, CreateQuoteData, UpdateQuoteData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { USE_SUPABASE } from "./config";

export const quoteService = {
  async getQuotes(): Promise<Quote[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('quote', {
        method: 'GET'
      });

      if (error) {
        console.error('Erreur lors de la récupération des devis:', error);
        throw new Error(error.message || 'Erreur lors de la récupération des devis');
      }

      return data || [];
    }
    
    // Mock implementation
    return [];
  },

  async getQuoteById(id: number): Promise<Quote | undefined> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('quote', {
        method: 'GET',
        body: { quoteId: id }
      });

      if (error) {
        console.error('Erreur lors de la récupération du devis:', error);
        return undefined;
      }

      return data;
    }
    
    // Mock implementation
    return undefined;
  },

  async getQuotesByPatientId(patientId: number): Promise<Quote[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('quote', {
        method: 'GET',
        body: { patientId }
      });

      if (error) {
        console.error('Erreur lors de la récupération des devis du patient:', error);
        throw new Error(error.message || 'Erreur lors de la récupération des devis');
      }

      return data || [];
    }
    
    // Mock implementation
    return [];
  },

  async createQuote(quoteData: CreateQuoteData): Promise<Quote> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('quote', {
        method: 'POST',
        body: quoteData
      });

      if (error) {
        console.error('Erreur lors de la création du devis:', error);
        throw new Error(error.message || 'Erreur lors de la création du devis');
      }

      return data;
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
      const { data, error } = await supabase.functions.invoke('quote', {
        method: 'PUT',
        body: { ...quoteData, quoteId: id }
      });

      if (error) {
        console.error('Erreur lors de la mise à jour du devis:', error);
        throw new Error(error.message || 'Erreur lors de la mise à jour du devis');
      }

      return data;
    }
    
    // Mock implementation
    return { 
      id, 
      ...quoteData 
    } as Quote;
  },

  async deleteQuote(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      const { error } = await supabase.functions.invoke('quote', {
        method: 'DELETE',
        body: { quoteId: id }
      });

      if (error) {
        console.error('Erreur lors de la suppression du devis:', error);
        throw new Error(error.message || 'Erreur lors de la suppression du devis');
      }

      return true;
    }
    
    // Mock implementation
    return true;
  },

  async sendQuote(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      const { error } = await supabase.functions.invoke('send-quote', {
        method: 'POST',
        body: { quoteId: id }
      });

      if (error) {
        console.error('Erreur lors de l\'envoi du devis:', error);
        throw new Error(error.message || 'Erreur lors de l\'envoi du devis');
      }

      return true;
    }
    
    // Mock implementation
    return true;
  }
};

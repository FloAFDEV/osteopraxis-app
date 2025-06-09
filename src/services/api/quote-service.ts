
import { Quote, CreateQuoteData, UpdateQuoteData } from "@/types";
import { USE_SUPABASE } from "./config";

export const quoteService = {
  async getQuotes(): Promise<Quote[]> {
    if (USE_SUPABASE) {
      // TODO: Implémenter avec Supabase
      console.log("getQuotes avec Supabase - à implémenter");
      return [];
    }
    
    // Mock implementation
    return [];
  },

  async getQuoteById(id: number): Promise<Quote | undefined> {
    if (USE_SUPABASE) {
      // TODO: Implémenter avec Supabase
      console.log("getQuoteById avec Supabase - à implémenter");
      return undefined;
    }
    
    // Mock implementation
    return undefined;
  },

  async getQuotesByPatientId(patientId: number): Promise<Quote[]> {
    if (USE_SUPABASE) {
      // TODO: Implémenter avec Supabase
      console.log("getQuotesByPatientId avec Supabase - à implémenter");
      return [];
    }
    
    // Mock implementation
    return [];
  },

  async createQuote(quoteData: CreateQuoteData): Promise<Quote> {
    if (USE_SUPABASE) {
      // TODO: Implémenter avec Supabase
      console.log("createQuote avec Supabase - à implémenter");
      return {
        id: Math.floor(Math.random() * 1000),
        ...quoteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Quote;
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
      // TODO: Implémenter avec Supabase
      console.log("updateQuote avec Supabase - à implémenter");
      return undefined;
    }
    
    // Mock implementation
    return { 
      id, 
      ...quoteData 
    } as Quote;
  },

  async deleteQuote(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      // TODO: Implémenter avec Supabase
      console.log("deleteQuote avec Supabase - à implémenter");
      return true;
    }
    
    // Mock implementation
    return true;
  },

  async sendQuote(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      // TODO: Implémenter avec Supabase - envoi par email
      console.log("sendQuote avec Supabase - à implémenter");
      return true;
    }
    
    // Mock implementation
    return true;
  }
};

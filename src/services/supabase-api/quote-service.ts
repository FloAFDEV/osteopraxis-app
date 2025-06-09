
import { supabase } from "@/integrations/supabase/client";
import { Quote, QuoteItem, CreateQuoteData, UpdateQuoteData } from "@/types";
import { getCurrentOsteopathId } from "./utils/getCurrentOsteopath";

export const supabaseQuoteService = {
  async getQuotes(): Promise<Quote[]> {
    try {
      const osteopathId = await getCurrentOsteopathId();
      if (!osteopathId) {
        console.warn("Aucun ostéopathe connecté pour récupérer les devis");
        return [];
      }

      const { data, error } = await supabase
        .from("Quote")
        .select(`
          *,
          QuoteItem (*)
        `)
        .eq("osteopathId", osteopathId)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erreur lors de la récupération des devis:", error);
        throw error;
      }

      return (data || []).map(quote => ({
        ...quote,
        items: quote.QuoteItem || []
      }));
    } catch (error) {
      console.error("Erreur dans getQuotes:", error);
      throw error;
    }
  },

  async getQuoteById(id: number): Promise<Quote | null> {
    try {
      const osteopathId = await getCurrentOsteopathId();
      if (!osteopathId) {
        throw new Error("Non autorisé: vous devez être connecté en tant qu'ostéopathe");
      }

      const { data, error } = await supabase
        .from("Quote")
        .select(`
          *,
          QuoteItem (*)
        `)
        .eq("id", id)
        .eq("osteopathId", osteopathId)
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la récupération du devis:", error);
        throw error;
      }

      if (!data) return null;

      return {
        ...data,
        items: data.QuoteItem || []
      };
    } catch (error) {
      console.error("Erreur dans getQuoteById:", error);
      throw error;
    }
  },

  async getQuotesByPatientId(patientId: number): Promise<Quote[]> {
    try {
      const osteopathId = await getCurrentOsteopathId();
      if (!osteopathId) {
        console.warn("Aucun ostéopathe connecté pour récupérer les devis du patient");
        return [];
      }

      const { data, error } = await supabase
        .from("Quote")
        .select(`
          *,
          QuoteItem (*)
        `)
        .eq("patientId", patientId)
        .eq("osteopathId", osteopathId)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erreur lors de la récupération des devis du patient:", error);
        throw error;
      }

      return (data || []).map(quote => ({
        ...quote,
        items: quote.QuoteItem || []
      }));
    } catch (error) {
      console.error("Erreur dans getQuotesByPatientId:", error);
      throw error;
    }
  },

  async createQuote(quoteData: CreateQuoteData): Promise<Quote> {
    try {
      const osteopathId = await getCurrentOsteopathId();
      if (!osteopathId) {
        throw new Error("Impossible de créer un devis: aucun ostéopathe connecté");
      }

      // Séparer les items du reste des données
      const { items, ...quoteWithoutItems } = quoteData;

      // Créer le devis principal
      const { data: quote, error: quoteError } = await supabase
        .from("Quote")
        .insert({
          ...quoteWithoutItems,
          osteopathId
        })
        .select()
        .single();

      if (quoteError) {
        console.error("Erreur lors de la création du devis:", quoteError);
        throw quoteError;
      }

      // Créer les items si ils existent
      let quoteItems: QuoteItem[] = [];
      if (items && items.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from("QuoteItem")
          .insert(
            items.map(item => ({
              ...item,
              quoteId: quote.id
            }))
          )
          .select();

        if (itemsError) {
          console.error("Erreur lors de la création des items du devis:", itemsError);
          throw itemsError;
        }

        quoteItems = itemsData || [];
      }

      return {
        ...quote,
        items: quoteItems
      };
    } catch (error) {
      console.error("Erreur dans createQuote:", error);
      throw error;
    }
  },

  async updateQuote(id: number, quoteData: UpdateQuoteData): Promise<Quote> {
    try {
      const osteopathId = await getCurrentOsteopathId();
      if (!osteopathId) {
        throw new Error("Impossible de modifier un devis: aucun ostéopathe connecté");
      }

      // Séparer les items du reste des données
      const { items, ...quoteWithoutItems } = quoteData;

      // Mettre à jour le devis principal
      const { data: quote, error: quoteError } = await supabase
        .from("Quote")
        .update(quoteWithoutItems)
        .eq("id", id)
        .eq("osteopathId", osteopathId)
        .select()
        .single();

      if (quoteError) {
        console.error("Erreur lors de la mise à jour du devis:", quoteError);
        throw quoteError;
      }

      // Gérer les items si fournis
      let quoteItems: QuoteItem[] = [];
      if (items !== undefined) {
        // Supprimer les anciens items
        await supabase
          .from("QuoteItem")
          .delete()
          .eq("quoteId", id);

        // Créer les nouveaux items
        if (items.length > 0) {
          const { data: itemsData, error: itemsError } = await supabase
            .from("QuoteItem")
            .insert(
              items.map(item => ({
                ...item,
                quoteId: id
              }))
            )
            .select();

          if (itemsError) {
            console.error("Erreur lors de la mise à jour des items du devis:", itemsError);
            throw itemsError;
          }

          quoteItems = itemsData || [];
        }
      } else {
        // Récupérer les items existants
        const { data: existingItems } = await supabase
          .from("QuoteItem")
          .select("*")
          .eq("quoteId", id);

        quoteItems = existingItems || [];
      }

      return {
        ...quote,
        items: quoteItems
      };
    } catch (error) {
      console.error("Erreur dans updateQuote:", error);
      throw error;
    }
  },

  async deleteQuote(id: number): Promise<{ error?: any }> {
    try {
      const osteopathId = await getCurrentOsteopathId();
      if (!osteopathId) {
        throw new Error("Impossible de supprimer un devis: aucun ostéopathe connecté");
      }

      const { error } = await supabase
        .from("Quote")
        .delete()
        .eq("id", id)
        .eq("osteopathId", osteopathId);

      if (error) {
        console.error("Erreur lors de la suppression du devis:", error);
        return { error };
      }

      return {};
    } catch (error) {
      console.error("Erreur dans deleteQuote:", error);
      return { error };
    }
  },

  async sendQuote(id: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("Quote")
        .update({ status: "SENT" })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de l'envoi du devis:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Erreur dans sendQuote:", error);
      throw error;
    }
  }
};

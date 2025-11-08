
import { supabase } from "@/integrations/supabase/client";
import { Quote, QuoteItem, CreateQuotePayload, QuoteStatus } from "@/types";
import { exportSecurity } from "@/utils/export-utils";
import { toast } from "sonner";

// Détection du mode démo
function isDemoMode(): boolean {
	// Mode démo éphémère local
	const localDemo = localStorage.getItem('isTemporaryDemo') === 'true';
	const sessionDemo = sessionStorage.getItem('isDemoMode') === 'true';
	return localDemo || sessionDemo;
}

// Stockage local pour les devis en mode démo
const DEMO_QUOTES_KEY = 'demo_quotes';

function getDemoQuotes(): Quote[] {
	if (!isDemoMode()) return [];
	
	try {
		const stored = localStorage.getItem(DEMO_QUOTES_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.debug('Erreur lecture devis démo:', error);
		return [];
	}
}

function saveDemoQuotes(quotes: Quote[]): void {
	if (!isDemoMode()) return;
	
	try {
		localStorage.setItem(DEMO_QUOTES_KEY, JSON.stringify(quotes));
	} catch (error) {
		console.debug('Erreur sauvegarde devis démo:', error);
	}
}

function generateDemoId(): number {
	return Date.now() + Math.floor(Math.random() * 1000);
}

export const quoteService = {
	async getQuotes(): Promise<Quote[]> {
		if (isDemoMode()) {
			console.debug('🎭 Mode démo: Récupération devis depuis stockage local');
			return getDemoQuotes();
		}

		const { data, error } = await supabase
			.from('Quote')
			.select(`
				*,
				"Patient"!patientId (firstName, lastName)
			`)
			.order('createdAt', { ascending: false });

		if (error) {
			console.error('Error fetching quotes:', error);
			throw error;
		}

		return (data || []).map(quote => ({
			...quote,
			status: quote.status as QuoteStatus,
			Patient: quote.Patient && !('error' in quote.Patient) ? quote.Patient : undefined
		})) as Quote[];
	},

	async getQuoteById(id: number): Promise<Quote | null> {
		if (isDemoMode()) {
			console.debug('🎭 Mode démo: Récupération devis par ID depuis stockage local');
			const quotes = getDemoQuotes();
			return quotes.find(q => q.id === id) || null;
		}

		const { data, error } = await supabase
			.from('Quote')
			.select(`
				*,
				"Patient"!patientId (firstName, lastName),
				"QuoteItem" (*)
			`)
			.eq('id', id)
			.single();

		if (error) {
			console.error('Error fetching quote:', error);
			throw error;
		}

		return {
			...data,
			status: data.status as QuoteStatus,
			Patient: data.Patient && !('error' in data.Patient) ? data.Patient : undefined
		} as Quote;
	},

	async getQuotesByPatientId(patientId: number): Promise<Quote[]> {
		if (isDemoMode()) {
			console.debug('🎭 Mode démo: Récupération devis patient depuis stockage local');
			const quotes = getDemoQuotes();
			return quotes.filter(q => q.patientId === patientId);
		}

		const { data, error } = await supabase
			.from('Quote')
			.select(`
				*,
				"Patient"!patientId (firstName, lastName),
				"QuoteItem" (*)
			`)
			.eq('patientId', patientId)
			.order('createdAt', { ascending: false });

		if (error) {
			console.error('Error fetching quotes for patient:', error);
			throw error;
		}

		return (data || []).map(quote => ({
			...quote,
			status: quote.status as QuoteStatus,
			Patient: quote.Patient && !('error' in quote.Patient) ? quote.Patient : undefined
		})) as Quote[];
	},

	async createQuote(quoteData: CreateQuotePayload): Promise<Quote> {
		if (isDemoMode()) {
			console.debug('🎭 Mode démo: Création devis en local');
			const quotes = getDemoQuotes();
			const newQuote: Quote = {
				...quoteData,
				id: generateDemoId(),
				status: "DRAFT" as QuoteStatus,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			} as Quote;
			
			quotes.push(newQuote);
			saveDemoQuotes(quotes);
			return newQuote;
		}

		// Générer un numéro de devis sécurisé selon le mode (démo ou connecté)
		const secureQuoteNumber = await exportSecurity.generateSecureQuoteNumber();
		const { items, ...quote } = quoteData;

		// Créer le devis avec numéro sécurisé
		const { data: newQuote, error: quoteError } = await supabase
			.from('Quote')
			.insert({
				...quote
			})
			.select()
			.single();

		if (quoteError) {
			console.error('Error creating quote:', quoteError);
			
			// 🔒 Détecter erreur RLS liée au plan d'abonnement
			if (quoteError.code === '42501' || quoteError.message?.toLowerCase().includes('row-level security') || 
			    quoteError.message?.toLowerCase().includes('policy')) {
				toast.error("Plan insuffisant", {
					description: "La création de devis nécessite le plan Full ou Pro. Mettez à niveau votre abonnement dans les paramètres.",
					duration: 6000,
				});
				throw new Error('PLAN_RESTRICTION: Votre plan actuel ne permet pas de créer des devis.');
			}
			
			throw quoteError;
		}

		// Créer les items si fournis
		if (items && items.length > 0) {
			const quoteItems = items.map(item => ({
				...item,
				quoteId: newQuote.id,
			}));

			const { error: itemsError } = await supabase
				.from('QuoteItem')
				.insert(quoteItems);

			if (itemsError) {
				console.error('Error creating quote items:', itemsError);
				
				// 🔒 Détecter erreur RLS liée au plan d'abonnement pour les items
				if (itemsError.code === '42501' || itemsError.message?.toLowerCase().includes('row-level security')) {
					toast.error("Plan insuffisant", {
						description: "La création d'items de devis nécessite le plan Full ou Pro.",
						duration: 6000,
					});
					throw new Error('PLAN_RESTRICTION: Items de devis non autorisés pour votre plan.');
				}
				
				throw itemsError;
			}
		}

		return {
			...newQuote,
			status: newQuote.status as QuoteStatus
		} as Quote;
	},

	async updateQuote(id: number, updates: Partial<Quote>): Promise<Quote> {
		if (isDemoMode()) {
			console.debug('🎭 Mode démo: Mise à jour devis en local');
			const quotes = getDemoQuotes();
			const index = quotes.findIndex(q => q.id === id);
			
			if (index === -1) {
				throw new Error('Devis non trouvé');
			}
			
			quotes[index] = {
				...quotes[index],
				...updates,
				updatedAt: new Date().toISOString()
			};
			
			saveDemoQuotes(quotes);
			return quotes[index];
		}

		const { data, error } = await supabase
			.from('Quote')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating quote:', error);
			throw error;
		}

		return {
			...data,
			status: data.status as QuoteStatus
		} as Quote;
	},

	async updateQuoteStatus(id: number, status: QuoteStatus): Promise<Quote> {
		return this.updateQuote(id, { status });
	},

	async deleteQuote(id: number): Promise<void> {
		if (isDemoMode()) {
			console.debug('🎭 Mode démo: Suppression devis en local');
			const quotes = getDemoQuotes();
			const filtered = quotes.filter(q => q.id !== id);
			saveDemoQuotes(filtered);
			return;
		}

		const { error } = await supabase
			.from('Quote')
			.delete()
			.eq('id', id);

		if (error) {
			console.error('Error deleting quote:', error);
			throw error;
		}
	},

	async addQuoteItem(quoteId: number, item: Omit<QuoteItem, 'id' | 'quoteId'>): Promise<QuoteItem> {
		if (isDemoMode()) {
			console.debug('🎭 Mode démo: Ajout item devis en local');
			// En mode démo, simuler l'ajout d'item
			const newItem: QuoteItem = {
				...item,
				id: generateDemoId(),
				quoteId
			};
			return newItem;
		}

		const { data, error } = await supabase
			.from('QuoteItem')
			.insert({ ...item, quoteId })
			.select()
			.single();

		if (error) {
			console.error('Error adding quote item:', error);
			throw error;
		}

		return data;
	},

	async updateQuoteItem(id: number, updates: Partial<QuoteItem>): Promise<QuoteItem> {
		if (isDemoMode()) {
			console.debug('🎭 Mode démo: Mise à jour item devis en local');
			// En mode démo, simuler la mise à jour
			throw new Error('Fonctionnalité limitée en mode démo');
		}

		const { data, error } = await supabase
			.from('QuoteItem')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating quote item:', error);
			throw error;
		}

		return data;
	},

	async deleteQuoteItem(id: number): Promise<void> {
		if (isDemoMode()) {
			console.debug('🎭 Mode démo: Suppression item devis en local');
			// En mode démo, simuler la suppression
			return;
		}

		const { error } = await supabase
			.from('QuoteItem')
			.delete()
			.eq('id', id);

		if (error) {
			console.error('Error deleting quote item:', error);
			throw error;
		}
	}
};


import { supabase } from "@/integrations/supabase/client";
import { Quote, QuoteItem, CreateQuotePayload, QuoteStatus } from "@/types";

export const quoteService = {
	async getQuotes(): Promise<Quote[]> {
		const { data, error } = await supabase.functions.invoke('quote');

		if (error) {
			console.error('Error fetching quotes:', error);
			throw error;
		}

		return (data || []).map((quote: any) => ({
			...quote,
			status: quote.status as QuoteStatus,
			Patient: quote.Patient && !('error' in quote.Patient) ? quote.Patient : undefined
		})) as Quote[];
	},

	async getQuoteById(id: number): Promise<Quote | null> {
		const { data, error } = await supabase.functions.invoke(`quote/${id}`);

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
		const { data, error } = await supabase.functions.invoke(`quote?patientId=${patientId}`);

		if (error) {
			console.error('Error fetching quotes for patient:', error);
			throw error;
		}

		return (data || []).map((quote: any) => ({
			...quote,
			status: quote.status as QuoteStatus,
			Patient: quote.Patient && !('error' in quote.Patient) ? quote.Patient : undefined
		})) as Quote[];
	},

	async createQuote(quoteData: CreateQuotePayload): Promise<Quote> {
		const { items, ...quote } = quoteData;

		const { data: newQuote, error: quoteError } = await supabase.functions.invoke('quote', {
			body: quote
		});

		if (quoteError) {
			console.error('Error creating quote:', quoteError);
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
				throw itemsError;
			}
		}

		return {
			...newQuote,
			status: newQuote.status as QuoteStatus
		} as Quote;
	},

	async updateQuote(id: number, updates: Partial<Quote>): Promise<Quote> {
		const response = await fetch(`https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/quote/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
			},
			body: JSON.stringify(updates)
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('Error updating quote:', errorData);
			throw new Error(`Failed to update quote: ${response.status}`);
		}

		const data = await response.json();
		return {
			...data,
			status: data.status as QuoteStatus
		} as Quote;
	},

	async updateQuoteStatus(id: number, status: QuoteStatus): Promise<Quote> {
		return this.updateQuote(id, { status });
	},

	async deleteQuote(id: number): Promise<void> {
		const response = await fetch(`https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/quote/${id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
			}
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('Error deleting quote:', errorData);
			throw new Error(`Failed to delete quote: ${response.status}`);
		}
	},

	async addQuoteItem(quoteId: number, item: Omit<QuoteItem, 'id' | 'quoteId'>): Promise<QuoteItem> {
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

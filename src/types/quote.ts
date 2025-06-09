
export interface Quote {
	id: number;
	patientId: number;
	osteopathId: number;
	cabinetId?: number | null;
	title: string;
	description?: string | null;
	amount: number;
	validUntil: string;
	status: QuoteStatus;
	notes?: string | null;
	createdAt: string;
	updatedAt: string;
	items?: QuoteItem[];
	Patient?: {
		firstName: string;
		lastName: string;
	};
}

export interface QuoteItem {
	id: number;
	quoteId: number;
	description: string;
	quantity: number;
	unitPrice: number;
	total: number;
}

export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface CreateQuotePayload {
	patientId: number;
	osteopathId: number;
	cabinetId?: number | null;
	title: string;
	description?: string | null;
	amount: number;
	validUntil: string;
	status: QuoteStatus;
	notes?: string | null;
	items?: Omit<QuoteItem, 'id' | 'quoteId'>[];
}

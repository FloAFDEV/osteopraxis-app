
export interface Quote {
  id: number;
  patientId: number;
  osteopathId: number;
  cabinetId?: number;
  title: string;
  description: string;
  amount: number;
  validUntil: string;
  status: QuoteStatus;
  items: QuoteItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface CreateQuoteData extends Omit<Quote, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateQuoteData extends Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>> {}

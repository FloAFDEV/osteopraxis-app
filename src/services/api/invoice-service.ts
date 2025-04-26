
import { Invoice, PaymentStatus } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseInvoiceService } from "../supabase-api/invoice-service";
import { supabase } from "@/integrations/supabase/client";

export const invoiceService = {
	async getInvoices(): Promise<Invoice[]> {
		try {
			const { data, error } = await supabase.from("Invoice").select("*");

			if (error) throw new Error(error.message);
			return data as Invoice[];
		} catch (error) {
			console.error("Erreur getInvoices:", error);
			throw error;
		}
	},

	async getInvoiceById(id: number): Promise<Invoice | undefined> {
		try {
			const { data, error } = await supabase
				.from("Invoice")
				.select("*")
				.eq("id", id)
				.single();

			if (error) throw new Error(error.message);
			return data as Invoice;
		} catch (error) {
			console.error("Erreur getInvoiceById:", error);
			throw error;
		}
	},

	async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
		try {
			const { data, error } = await supabase
				.from("Invoice")
				.select("*")
				.eq("patientId", patientId);

			if (error) throw new Error(error.message);
			return data as Invoice[];
		} catch (error) {
			console.error("Erreur getInvoicesByPatientId:", error);
			throw error;
		}
	},

	async createInvoice(invoiceData: Omit<Invoice, "id">): Promise<Invoice> {
		try {
			const { data, error } = await supabase
				.from("Invoice")
				.insert([invoiceData])
				.select()
				.single();

			if (error) throw new Error(error.message);
			return data as Invoice;
		} catch (error) {
			console.error("Erreur createInvoice:", error);
			throw error;
		}
	},

	async updateInvoice(
		id: number,
		invoiceData: Partial<Invoice>
	): Promise<Invoice | undefined> {
		try {
			const { data, error } = await supabase
				.from("Invoice")
				.update(invoiceData)
				.eq("id", id)
				.select()
				.single();

			if (error) throw new Error(error.message);
			return data as Invoice;
		} catch (error) {
			console.error("Erreur updateInvoice:", error);
			throw error;
		}
	},

	async updatePaymentStatus(
		id: number,
		paymentStatus: PaymentStatus
	): Promise<Invoice | undefined> {
		return this.updateInvoice(id, { paymentStatus });
	},

	async deleteInvoice(id: number): Promise<boolean> {
		try {
			const { error } = await supabase
				.from("Invoice")
				.delete()
				.eq("id", id);

			if (error) throw new Error(error.message);
			return true;
		} catch (error) {
			console.error("Erreur deleteInvoice:", error);
			throw error;
		}
	},

	async getInvoicesByPeriod(
		period: "month" | "sixMonths" | "year"
	): Promise<Invoice[]> {
		try {
			const now = new Date();
			let startDate = new Date();

			if (period === "month") {
				startDate.setMonth(now.getMonth() - 1);
			} else if (period === "sixMonths") {
				startDate.setMonth(now.getMonth() - 6);
			} else if (period === "year") {
				startDate.setFullYear(now.getFullYear() - 1);
			}

			const { data, error } = await supabase
				.from("Invoice")
				.select("*")
				.gte("date", startDate.toISOString())
				.lte("date", now.toISOString())
				.order("date", { ascending: false });

			if (error) throw new Error(error.message);
			return data as Invoice[];
		} catch (error) {
			console.error(`Erreur getInvoicesByPeriod (${period}):`, error);
			throw error;
		}
	},

	async getInvoiceSummary(period: "month" | "sixMonths" | "year"): Promise<{
		total: number;
		paid: number;
		pending: number;
		canceled: number;
		count: number;
	}> {
		try {
			const invoices = await this.getInvoicesByPeriod(period);

			const summary = {
				total: 0,
				paid: 0,
				pending: 0,
				canceled: 0,
				count: invoices.length,
			};

			invoices.forEach((invoice) => {
				if (invoice.paymentStatus !== "CANCELED") {
					summary.total += invoice.amount;
				}
				if (invoice.paymentStatus === "PAID") {
					summary.paid += invoice.amount;
				} else if (invoice.paymentStatus === "PENDING") {
					summary.pending += invoice.amount;
				} else if (invoice.paymentStatus === "CANCELED") {
					summary.canceled += invoice.amount;
				}
			});

			return summary;
		} catch (error) {
			console.error(`Erreur getInvoiceSummary (${period}):`, error);
			throw error;
		}
	},
};

export { supabaseInvoiceService };

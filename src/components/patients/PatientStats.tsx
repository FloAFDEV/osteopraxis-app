
import React from "react";
import { StatCardV2 } from "@/components/ui/stat-card-v2";
import { Appointment, Invoice } from "@/types";

interface PatientStatsProps {
  appointments: Appointment[];
  invoices: Invoice[];
}

export function PatientStats({ appointments, invoices }: PatientStatsProps) {
  const stats = [
    {
      label: "Total RDV",
      value: appointments.length,
      color: "blue" as const
    },
    {
      label: "RDV à venir",
      value: appointments.filter(app => app.status === "SCHEDULED" && new Date(app.date) >= new Date()).length,
      color: "purple" as const
    },
    {
      label: "Factures",
      value: invoices.length,
      color: "amber" as const
    },
    {
      label: "Montant dû",
      value: `${invoices
        .filter(inv => inv.paymentStatus === "PENDING")
        .reduce((acc, inv) => acc + inv.amount, 0)
        .toFixed(2)} €`,
      color: "red" as const
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCardV2
          key={index}
          label={stat.label}
          value={stat.value}
          color={stat.color}
        />
      ))}
    </div>
  );
}

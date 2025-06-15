
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpecializedFieldsTabProps {
  form: UseFormReturn<PatientFormValues>;
}

export function SpecializedFieldsTab({ form }: SpecializedFieldsTabProps) {
  return (
    <div className="p-0 md:p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Cardiaque
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("cardiac_history")}
              placeholder="Antécédents cardiaques"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Pulmonaire
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("pulmonary_history")}
              placeholder="Antécédents pulmonaires"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Pelvien / Gynéco-Uro
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("pelvic_history")}
              placeholder="Historique pelvien/gynéco-uro"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Neurologique
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("neurological_history")}
              placeholder="Historique neurologique"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Neurodéveloppemental
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("neurodevelopmental_history")}
              placeholder="Historique neurodéveloppemental"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Examen nerfs crâniens
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("cranial_nerve_exam")}
              placeholder="Compte-rendu examen nerfs crâniens"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Examen dentaire
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("dental_exam")}
              placeholder="Examen dentaire"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Examen crânien
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("cranial_exam")}
              placeholder="Examen crânien"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Tests LMO
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("lmo_tests")}
              placeholder="Tests LMO"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Membranes crâniennes
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("cranial_membrane_exam")}
              placeholder="Membranes crâniennes"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Historique musculo-sq.
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("musculoskeletal_history")}
              placeholder="Historique musculo-squelettique"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Examen membre inf.
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("lower_limb_exam")}
              placeholder="Examen membre inférieur"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Examen membre sup.
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("upper_limb_exam")}
              placeholder="Examen membre supérieur"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Examen épaule
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("shoulder_exam")}
              placeholder="Examen épaule"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Scoliose
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("scoliosis")}
              placeholder="Scoliose"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Examen fascias
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("fascia_exam")}
              placeholder="Examen fascias"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Masque facial
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("facial_mask_exam")}
              placeholder="Examen masque facial"
            />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 border rounded-lg">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-base font-semibold text-primary">
              Examen vasculaire
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <textarea
              className="input w-full resize-none min-h-[80px] rounded-md border border-gray-300 px-3 py-2"
              {...form.register("vascular_exam")}
              placeholder="Examen vasculaire"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

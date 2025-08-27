import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Brain, Eye, Bone, Heart, Stethoscope, Activity } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

interface SpecializedSpheresTabProps {
    form: UseFormReturn<PatientFormValues>;
}

const renderTextareaCard = (
    title: string,
    name: keyof PatientFormValues,
    placeholder: string,
    form: UseFormReturn<PatientFormValues>
) => (
    <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel>{title}</FormLabel>
                <FormControl>
                    <Textarea
                        placeholder={placeholder}
                        {...field}
                        value={typeof field.value === 'string' ? field.value : ""}
                        rows={3}
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
);

const Section = ({ 
    title, 
    icon: Icon, 
    iconColor = "text-primary", 
    children,
    defaultOpen = false
}: { 
    title: string; 
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; 
    iconColor?: string; 
    children: React.ReactNode;
    defaultOpen?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Card className="border border-muted">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${iconColor}`} />
                            <h3 className="text-base font-medium">{title}</h3>
                        </div>
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                        {children}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};

export const SpecializedSpheresTab = ({ form }: SpecializedSpheresTabProps) => {
    return (
        <div className="space-y-4">
            <Section title="Sphère crânienne" icon={Brain} iconColor="text-purple-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderTextareaCard("Examen crânien", "cranial_exam", "Observations de l'examen crânien", form)}
                    {renderTextareaCard("Examen des membranes crâniennes", "cranial_membrane_exam", "État des membranes crâniennes", form)}
                </div>
                {renderTextareaCard("Examen des nerfs crâniens", "cranial_nerve_exam", "Évaluation des nerfs crâniens", form)}
            </Section>

            <Section title="Sphère dentaire et faciale" icon={Eye} iconColor="text-blue-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderTextareaCard("Examen dentaire", "dental_exam", "État dentaire et occlusion", form)}
                    {renderTextareaCard("Examen du masque facial", "facial_mask_exam", "Symétrie et tonus du visage", form)}
                </div>
            </Section>

            <Section title="Tests et mobilité" icon={Activity} iconColor="text-green-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderTextareaCard("Tests LMO", "lmo_tests", "Tests de mobilité ostéopathique", form)}
                    {renderTextareaCard("Examen des fascias", "fascia_exam", "État des fascias", form)}
                </div>
            </Section>

            <Section title="Sphère vasculaire" icon={Heart} iconColor="text-red-600">
                {renderTextareaCard("Examen vasculaire", "vascular_exam", "Évaluation vasculaire", form)}
            </Section>

            <Section title="Membres inférieurs" icon={Bone} iconColor="text-orange-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderTextareaCard("Examen des membres inférieurs", "lower_limb_exam", "Mobilité et alignement des membres inférieurs", form)}
                    {renderTextareaCard("Scoliose", "scoliosis", "Évaluation de la scoliose", form)}
                </div>
            </Section>

            <Section title="Membres supérieurs" icon={Stethoscope} iconColor="text-indigo-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderTextareaCard("Examen des membres supérieurs", "upper_limb_exam", "Mobilité et force des membres supérieurs", form)}
                    {renderTextareaCard("Examen des épaules", "shoulder_exam", "Mobilité et stabilité des épaules", form)}
                </div>
            </Section>
        </div>
    );
};
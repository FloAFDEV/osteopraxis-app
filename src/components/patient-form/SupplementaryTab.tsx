import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

interface SupplementaryTabProps {
    form: UseFormReturn<PatientFormValues>;
}

export const SupplementaryTab = ({ form }: SupplementaryTabProps) => {
    return (
        <Card>
            <CardContent className="space-y-4 mt-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-primary">Informations techniques</h3>
                    <FormField
                        control={form.control}
                        name="hdlm"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>HDLM</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Informations HDLM"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="avatarUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL de l'avatar</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="URL de l'image de profil"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
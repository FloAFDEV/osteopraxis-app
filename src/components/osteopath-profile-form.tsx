
import { ProfessionalProfile } from "@/types";
import { ProfessionalProfileForm } from "@/components/professional-profile-form";
import { OsteopathProfileFormProps } from "@/types";

export function OsteopathProfileForm(props: OsteopathProfileFormProps) {
  const { defaultValues, osteopathId, profileId, isEditing, onSuccess } = props;
  
  // Forward the props to ProfessionalProfileForm with the correct property names
  return (
    <ProfessionalProfileForm 
      defaultValues={defaultValues}
      professionalProfileId={osteopathId || profileId}
      isEditing={isEditing}
      onSuccess={onSuccess}
    />
  );
}

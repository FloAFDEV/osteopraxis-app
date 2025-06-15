
-- Ajout uniquement des champs historiques / examens pour les nouvelles sphères médicales dans la table Patient
alter table "Patient"
add column if not exists cardiac_history text,
add column if not exists pulmonary_history text,
add column if not exists pelvic_history text,
add column if not exists neurological_history text,
add column if not exists neurodevelopmental_history text,
add column if not exists cranial_nerve_exam text,
add column if not exists dental_exam text,
add column if not exists cranial_exam text,
add column if not exists lmo_tests text,
add column if not exists cranial_membrane_exam text,
add column if not exists musculoskeletal_history text,
add column if not exists lower_limb_exam text,
add column if not exists upper_limb_exam text,
add column if not exists shoulder_exam text,
add column if not exists scoliosis text,
add column if not exists facial_mask_exam text,
add column if not exists fascia_exam text,
add column if not exists vascular_exam text;

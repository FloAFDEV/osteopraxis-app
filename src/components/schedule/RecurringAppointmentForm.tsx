import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Repeat } from 'lucide-react';
import { PatientCombobox } from '@/components/patients/PatientCombobox';

interface RecurringAppointmentFormProps {
  onSubmit: (data: any) => void;
  patients: any[];
}

export const RecurringAppointmentForm = ({ onSubmit, patients }: RecurringAppointmentFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    reason: '',
    recurrenceType: 'weekly',
    startDate: '',
    startTime: '09:00',
    weekdays: [1, 2, 3, 4, 5], // Lundi à Vendredi par défaut
    endDate: '',
    maxOccurrences: '',
    notes: ''
  });

  const weekDays = [
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' },
    { value: 0, label: 'Dimanche' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setIsOpen(false);
    setFormData({
      patientId: '',
      reason: '',
      recurrenceType: 'weekly',
      startDate: '',
      startTime: '09:00',
      weekdays: [1, 2, 3, 4, 5],
      endDate: '',
      maxOccurrences: '',
      notes: ''
    });
  };

  const toggleWeekday = (day: number) => {
    setFormData(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter(d => d !== day)
        : [...prev.weekdays, day]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Repeat className="h-4 w-4" />
          Séance récurrente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Créer une série de rendez-vous
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <PatientCombobox
                patients={patients}
                selectedPatientId={formData.patientId ? parseInt(formData.patientId) : null}
                onPatientSelect={(patient) => 
                  setFormData(prev => ({ ...prev, patientId: patient.id.toString() }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motif</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Suivi ostéopathique"
                required
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuration de la récurrence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type de récurrence</Label>
                  <Select value={formData.recurrenceType} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, recurrenceType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="biweekly">Bi-hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Heure</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {(formData.recurrenceType === 'weekly' || formData.recurrenceType === 'biweekly') && (
                <div className="space-y-2">
                  <Label>Jours de la semaine</Label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={formData.weekdays.includes(day.value)}
                          onCheckedChange={() => toggleWeekday(day.value)}
                        />
                        <Label htmlFor={`day-${day.value}`} className="text-sm">{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin (optionnelle)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOccurrences">Nombre max (optionnel)</Label>
                  <Input
                    id="maxOccurrences"
                    type="number"
                    min="1"
                    value={formData.maxOccurrences}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxOccurrences: e.target.value }))}
                    placeholder="Ex: 10 séances"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes additionnelles..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer la série
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
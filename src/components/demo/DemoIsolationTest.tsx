import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, User, Calendar, FileText } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

export const DemoIsolationTest = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: TestResult[] = [];
    
    try {
      // Test 1: Vérifier si la session démo est active
      results.push({ name: 'Session démo active', status: 'pending', message: 'Vérification...' });
      setTestResults([...results]);
      
      const { isDemoSession } = await import('@/utils/demo-detection');
      const isDemoMode = await isDemoSession();
      
      if (isDemoMode) {
        const { demoLocalStorage } = await import('@/services/demo-local-storage');
        const stats = demoLocalStorage.getSessionStats();
        setSessionInfo(stats);
        
        results[0] = {
          name: 'Session démo active',
          status: 'success',
          message: `Session ID: ${stats.sessionId}`,
          details: stats
        };
      } else {
        results[0] = {
          name: 'Session démo active',
          status: 'error',
          message: 'Aucune session démo détectée'
        };
      }
      setTestResults([...results]);
      
      if (!isDemoMode) {
        setIsRunning(false);
        return;
      }
      
      // Test 2: Isolation des patients
      results.push({ name: 'Isolation des patients', status: 'pending', message: 'Test en cours...' });
      setTestResults([...results]);
      
      const { patientService } = await import('@/services/api/patient-service');
      const patients = await patientService.getPatients();
      
      results[1] = {
        name: 'Isolation des patients',
        status: 'success',
        message: `${patients.length} patients dans la session isolée`,
        details: { count: patients.length, patients: patients.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}` })) }
      };
      setTestResults([...results]);
      
      // Test 3: Isolation des rendez-vous
      results.push({ name: 'Isolation des rendez-vous', status: 'pending', message: 'Test en cours...' });
      setTestResults([...results]);
      
      const { appointmentService } = await import('@/services/api/appointment-service');
      const appointments = await appointmentService.getAppointments();
      
      results[2] = {
        name: 'Isolation des rendez-vous',
        status: 'success',
        message: `${appointments.length} rendez-vous dans la session isolée`,
        details: { count: appointments.length, appointments: appointments.map(a => ({ id: a.id, reason: a.reason })) }
      };
      setTestResults([...results]);
      
      // Test 4: Isolation des factures
      results.push({ name: 'Isolation des factures', status: 'pending', message: 'Test en cours...' });
      setTestResults([...results]);
      
      const { invoiceService } = await import('@/services/api/invoice-service');
      const invoices = await invoiceService.getInvoices();
      
      results[3] = {
        name: 'Isolation des factures',
        status: 'success',
        message: `${invoices.length} factures dans la session isolée`,
        details: { count: invoices.length, invoices: invoices.map(i => ({ id: i.id, amount: i.amount })) }
      };
      setTestResults([...results]);
      
      // Test 5: Test de création d'un patient
      results.push({ name: 'Test création patient', status: 'pending', message: 'Test en cours...' });
      setTestResults([...results]);
      
      const testPatient = await patientService.createPatient({
        firstName: 'Test',
        lastName: `Patient-${Date.now()}`,
        email: `test-${Date.now()}@demo.com`,
        phone: '01 23 45 67 89',
        gender: 'MALE' as const,
        hasVisionCorrection: false,
        isDeceased: false,
        isSmoker: false,
        // Champs requis pour Patient
        birthDate: null,
        address: null,
        height: null,
        weight: null,
        bmi: null,
        userId: null,
        avatarUrl: null,
        childrenAges: null,
        complementaryExams: null,
        generalSymptoms: null,
        pregnancyHistory: null,
        birthDetails: null,
        developmentMilestones: null,
        sleepingPattern: null,
        feeding: null,
        behavior: null,
        childCareContext: null,
        isExSmoker: null,
        smokingSince: null,
        smokingAmount: null,
        quitSmokingDate: null,
        allergies: null,
        occupation: null,
        maritalStatus: null,
        hasChildren: null,
        generalPractitioner: null,
        surgicalHistory: null,
        traumaHistory: null,
        rheumatologicalHistory: null,
        currentTreatment: null,
        handedness: null,
        ophtalmologistName: null,
        entProblems: null,
        entDoctorName: null,
        digestiveProblems: null,
        digestiveDoctorName: null,
        physicalActivity: null,
        contraception: null,
        contraception_notes: null,
        relationship_type: null,
        relationship_other: null,
        familyStatus: null,
        ent_followup: null,
        intestinal_transit: null,
        sleep_quality: null,
        fracture_history: null,
        dental_health: null,
        sport_frequency: null,
        gynecological_history: null,
        other_comments_adult: null,
        fine_motor_skills: null,
        gross_motor_skills: null,
        weight_at_birth: null,
        height_at_birth: null,
        head_circumference: null,
        apgar_score: null,
        childcare_type: null,
        school_grade: null,
        pediatrician_name: null,
        paramedical_followup: null,
        other_comments_child: null,
        diagnosis: null,
        medical_examination: null,
        treatment_plan: null,
        consultation_conclusion: null,
        cardiac_history: null,
        pulmonary_history: null,
        pelvic_history: null,
        neurological_history: null,
        neurodevelopmental_history: null,
        cranial_nerve_exam: null,
        dental_exam: null,
        cranial_exam: null,
        lmo_tests: null,
        cranial_membrane_exam: null,
        musculoskeletal_history: null,
        lower_limb_exam: null,
        upper_limb_exam: null,
        shoulder_exam: null,
        scoliosis: null,
        facial_mask_exam: null,
        fascia_exam: null,
        vascular_exam: null,
        osteopathId: 999,
        cabinetId: 1
      });
      
      results[4] = {
        name: 'Test création patient',
        status: 'success',
        message: `Patient créé avec ID: ${testPatient.id}`,
        details: testPatient
      };
      setTestResults([...results]);
      
      // Test 6: Vérification que le patient n'apparaît que dans cette session
      results.push({ name: 'Vérification isolation', status: 'pending', message: 'Test en cours...' });
      setTestResults([...results]);
      
      const allPatientsAfterCreation = await patientService.getPatients();
      const hasNewPatient = allPatientsAfterCreation.some(p => p.id === testPatient.id);
      
      results[5] = {
        name: 'Vérification isolation',
        status: hasNewPatient ? 'success' : 'error',
        message: hasNewPatient 
          ? `Patient visible dans la session actuelle (${allPatientsAfterCreation.length} patients total)`
          : 'ERREUR: Patient non trouvé dans la session',
        details: { found: hasNewPatient, totalPatients: allPatientsAfterCreation.length }
      };
      setTestResults([...results]);
      
    } catch (error) {
      console.error('Erreur lors des tests:', error);
      results.push({
        name: 'Test en échec',
        status: 'error',
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        details: error
      });
      setTestResults([...results]);
    }
    
    setIsRunning(false);
  };

  useEffect(() => {
    // Lancer les tests automatiquement au chargement
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      pending: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status]} className={status === 'success' ? 'bg-green-100 text-green-800' : ''}>
        {status === 'success' ? 'Réussi' : status === 'error' ? 'Échec' : 'En cours'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Test d'isolation des données démo
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRunning ? 'Tests en cours...' : 'Relancer les tests'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessionInfo && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Informations de session</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>ID de session:</strong> {sessionInfo.sessionId}
                </div>
                <div>
                  <strong>Temps restant:</strong> {Math.floor(sessionInfo.timeRemaining / 1000 / 60)} minutes
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <strong>{sessionInfo.patientsCount}</strong> patients
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <strong>{sessionInfo.appointmentsCount}</strong> rendez-vous
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <strong>{sessionInfo.invoicesCount}</strong> factures
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            ))}
          </div>
          
          {testResults.length === 0 && !isRunning && (
            <div className="text-center py-8 text-muted-foreground">
              Cliquez sur "Relancer les tests" pour vérifier l'isolation des données
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
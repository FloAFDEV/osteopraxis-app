import { supabase } from '@/integrations/supabase/client';

export const debugAuthService = {
  async checkAuthenticationStatus() {
    console.log("=== DEBUG AUTH STATUS ===");
    
    // 1. Vérifier la session Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log("Session data:", sessionData);
    console.log("Session error:", sessionError);
    
    if (!sessionData?.session) {
      console.log("❌ No active session");
      return { authenticated: false, reason: "No session" };
    }
    
    console.log("✅ Session found, user ID:", sessionData.session.user.id);
    
    // 2. Tester la fonction de debug
    try {
      const { data: debugData, error: debugError } = await supabase
        .rpc('get_current_osteopath_id_debug');
      
      console.log("Debug function result:", debugData);
      console.log("Debug function error:", debugError);
      
      if (debugError) {
        console.log("❌ Debug function error:", debugError);
        return { authenticated: true, reason: "Debug function failed", error: debugError };
      }
      
      if (debugData && debugData.length > 0) {
        const result = debugData[0];
        console.log("✅ Debug result:", result);
        return { 
          authenticated: true, 
          authUid: result.auth_uid, 
          osteopathId: result.osteopath_id, 
          message: result.error_message 
        };
      }
    } catch (error) {
      console.log("❌ Error calling debug function:", error);
      return { authenticated: true, reason: "Debug function exception", error };
    }
    
    // 3. Tester un simple select sur Appointment
    try {
      const { data: appointmentData, error: appointmentError } = await supabase
        .from("Appointment")
        .select("id")
        .limit(1);
      
      console.log("Simple appointment select:", appointmentData);
      console.log("Simple appointment error:", appointmentError);
      
      if (appointmentError) {
        console.log("❌ Appointment access error:", appointmentError);
        return { 
          authenticated: true, 
          reason: "RLS policy blocking access", 
          error: appointmentError 
        };
      }
      
      console.log("✅ Appointment access successful");
      return { authenticated: true, reason: "All checks passed" };
    } catch (error) {
      console.log("❌ Appointment query exception:", error);
      return { authenticated: true, reason: "Appointment query failed", error };
    }
  }
};
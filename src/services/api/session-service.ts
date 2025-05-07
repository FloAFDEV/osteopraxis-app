
import { delay, USE_SUPABASE } from "./config";
import { formatAppointmentDate } from "@/utils/date-utils";

export interface Session {
  id?: number;
  patientId: number;
  motif: string;
  compteRendu: string;
  status: "DRAFT" | "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  date: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
}

// In-memory sessions storage for non-Supabase mode
const sessions: Session[] = [];

export const sessionService = {
  async getSessions(): Promise<Session[]> {
    if (USE_SUPABASE) {
      // TODO: Implement Supabase method
      console.log("Using Supabase for getSessions");
    }
    
    await delay(300);
    return [...sessions];
  },
  
  async getSessionsByPatientId(patientId: number): Promise<Session[]> {
    if (USE_SUPABASE) {
      // TODO: Implement Supabase method
      console.log("Using Supabase for getSessionsByPatientId");
    }
    
    await delay(200);
    return sessions.filter(session => session.patientId === patientId);
  },
  
  async getSessionById(id: number): Promise<Session | undefined> {
    if (USE_SUPABASE) {
      // TODO: Implement Supabase method
      console.log("Using Supabase for getSessionById");
    }
    
    await delay(200);
    return sessions.find(session => session.id === id);
  },
  
  async createSession(session: Omit<Session, "id">): Promise<Session> {
    if (USE_SUPABASE) {
      // TODO: Implement Supabase method
      console.log("Using Supabase for createSession");
    }
    
    await delay(400);
    const newSession = {
      ...session,
      id: sessions.length + 1,
      date: typeof session.date === 'string' ? new Date(session.date) : session.date,
      actualStartTime: session.actualStartTime ? (
        typeof session.actualStartTime === 'string' ? new Date(session.actualStartTime) : session.actualStartTime
      ) : undefined,
      actualEndTime: session.actualEndTime ? (
        typeof session.actualEndTime === 'string' ? new Date(session.actualEndTime) : session.actualEndTime
      ) : undefined
    };
    
    sessions.push(newSession);
    return newSession;
  },
  
  async updateSession(session: Session): Promise<Session> {
    if (USE_SUPABASE) {
      // TODO: Implement Supabase method
      console.log("Using Supabase for updateSession");
    }
    
    await delay(300);
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index !== -1) {
      // Process dates if they are strings
      const updatedSession = {
        ...session,
        date: typeof session.date === 'string' ? new Date(session.date) : session.date,
        actualStartTime: session.actualStartTime ? (
          typeof session.actualStartTime === 'string' ? new Date(session.actualStartTime) : session.actualStartTime
        ) : undefined,
        actualEndTime: session.actualEndTime ? (
          typeof session.actualEndTime === 'string' ? new Date(session.actualEndTime) : session.actualEndTime
        ) : undefined
      };
      
      sessions[index] = updatedSession;
      return updatedSession;
    }
    
    throw new Error(`Session with id ${session.id} not found`);
  },
  
  async deleteSession(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      // TODO: Implement Supabase method
      console.log("Using Supabase for deleteSession");
    }
    
    await delay(300);
    const index = sessions.findIndex(s => s.id === id);
    
    if (index !== -1) {
      sessions.splice(index, 1);
      return true;
    }
    
    return false;
  },
  
  async updatePatientHDLM(patientId: number, hdlm: string): Promise<boolean> {
    if (USE_SUPABASE) {
      // TODO: Implement Supabase method
      console.log("Using Supabase for updatePatientHDLM");
    }
    
    await delay(200);
    console.log(`Updated HDLM for patient ${patientId}: ${hdlm}`);
    return true;
  }
};

export default sessionService;

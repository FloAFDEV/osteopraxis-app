export interface AdminLogEntry {
  id: string;
  timestamp: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
}

export interface AdminSettings {
  max_login_attempts: number;
  session_timeout: number;
  backup_frequency: number;
  maintenance_mode: boolean;
}

export interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  description: string;
}

export interface OptimizationTask {
  id: string;
  name: string;
  description: string;
  category: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  status: "pending" | "running" | "completed" | "failed";
  lastRun?: string;
  nextRun?: string;
}
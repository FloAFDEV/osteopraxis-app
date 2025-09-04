import {
  User,
  Hospital,
  ClipboardList,
  Microscope,
  Stethoscope,
  Baby,
  FileText,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle,
  Briefcase,
  Mail,
  MapPin,
  Phone,
  Heart,
  Bone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  Target,
  Shield,
  Database,
  Calendar,
  UserPlus,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Upload,
  Download,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowLeft,
  ArrowRight,
  Send,
  Star,
  Copy,
  Printer,
  Download as FileDownload,
  UserCheck,
  CircleCheck,
  CircleX,
  CircleAlert,
  Ban,
  Pause,
  Play,
  FastForward,
  RotateCcw,
  Filter as FilterIcon,
  LucideIcon
} from "lucide-react";

// Types pour les icônes d'application
export type AppIconType = 
  // Icônes de navigation/sections
  | "identity" | "medical" | "history" | "examination" | "specialized" 
  | "pediatric" | "notes" | "tracking" | "family"
  // Icônes d'état/feedback
  | "success" | "error" | "warning" | "info" | "loading" | "target"
  | "approved" | "rejected" | "pending" | "cancelled" | "draft"
  // Icônes médicales
  | "heart" | "bone" | "activity" | "alert" | "baby" | "stethoscope"
  // Icônes de contact
  | "email" | "phone" | "address" | "occupation"
  // Icônes d'action
  | "save" | "edit" | "delete" | "view" | "add" | "search" | "filter"
  | "refresh" | "upload" | "download" | "settings" | "send" | "copy"
  | "print" | "export" | "star" | "favorite"
  // Icônes de navigation
  | "home" | "back" | "forward" | "up" | "down" | "left" | "right"
  // Icônes de statut de rendez-vous
  | "scheduled" | "confirmed" | "completed" | "missed" | "rescheduled";

// Mapping des icônes d'application vers les icônes Lucide
export const appIcons: Record<AppIconType, LucideIcon> = {
  // Navigation/sections
  identity: User,
  medical: Hospital,
  history: ClipboardList,
  examination: Microscope,
  specialized: Stethoscope,
  pediatric: Baby,
  notes: FileText,
  tracking: TrendingUp,
  family: Users,
  
  // États/feedback
  success: CircleCheck,
  error: CircleX,
  warning: CircleAlert,
  info: Info,
  loading: Clock,
  target: Target,
  approved: CheckCircle,
  rejected: Ban,
  pending: Clock,
  cancelled: XCircle,
  draft: Edit,
  
  // Médicales
  heart: Heart,
  bone: Bone,
  activity: Activity,
  alert: AlertTriangle,
  baby: Baby,
  stethoscope: Stethoscope,
  
  // Contact
  email: Mail,
  phone: Phone,
  address: MapPin,
  occupation: Briefcase,
  
  // Actions
  save: Save,
  edit: Edit,
  delete: Trash2,
  view: Eye,
  add: Plus,
  search: Search,
  filter: FilterIcon,
  refresh: RefreshCw,
  upload: Upload,
  download: Download,
  settings: Settings,
  send: Send,
  copy: Copy,
  print: Printer,
  export: FileDownload,
  star: Star,
  favorite: Star,
  
  // Navigation
  home: Home,
  back: ArrowLeft,
  forward: ArrowRight,
  up: ChevronUp,
  down: ChevronDown,
  left: ChevronLeft,
  right: ChevronRight,
  
  // Statuts de rendez-vous
  scheduled: Calendar,
  confirmed: UserCheck,
  completed: CircleCheck,
  missed: CircleX,
  rescheduled: RotateCcw
};

// Composant utilitaire pour afficher les icônes d'application
interface AppIconProps {
  name: AppIconType;
  className?: string;
  size?: number;
  color?: string;
}

export function AppIcon({ name, className, size = 20, color = "currentColor" }: AppIconProps) {
  const IconComponent = appIcons[name];
  
  if (!IconComponent) {
    console.warn(`Icône non trouvée: ${name}`);
    return <AlertTriangle className={className} size={size} color={color} />;
  }
  
  return <IconComponent className={className} size={size} color={color} />;
}

// Hook pour obtenir facilement une icône
export function useAppIcon(name: AppIconType): LucideIcon {
  return appIcons[name] || AlertTriangle;
}

export default appIcons;
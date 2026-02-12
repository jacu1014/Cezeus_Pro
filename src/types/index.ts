export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
  ENTRENADOR = 'ENTRENADOR',
  DIRECTOR = 'DIRECTOR',
  ALUMNO = 'ALUMNO'
}

export enum AppPages {
  DASHBOARD = 'dashboard',
  ALUMNOS = 'alumnos',
  EVALUACION = 'evaluacion',
  PAGOS = 'pagos',
  CALENDARIO = 'calendar_today',
  NOTIFICACIONES = 'notifications_active',
  CONFIGURACION = 'settings'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// --- LÓGICA DE PERMISOS PARA EL SIDEBAR ---
export const ROLE_PERMISSIONS: Record<UserRole, AppPages[]> = {
  // Super Admin: Acceso total
  [UserRole.SUPER_ADMIN]: Object.values(AppPages),

  // Director y Administrativo: Ven todo (las restricciones internas van en el componente)
  [UserRole.DIRECTOR]: Object.values(AppPages),
  [UserRole.ADMINISTRATIVO]: Object.values(AppPages),

  // Entrenador: No ve Configuración
  [UserRole.ENTRENADOR]: [
    AppPages.DASHBOARD,
    AppPages.ALUMNOS,
    AppPages.EVALUACION,
    AppPages.PAGOS,
    AppPages.CALENDARIO,
    AppPages.NOTIFICACIONES
  ],

  // Alumno: No ve Dashboard ni Configuración
  [UserRole.ALUMNO]: [
    AppPages.ALUMNOS,
    AppPages.EVALUACION,
    AppPages.PAGOS,
    AppPages.CALENDARIO,
    AppPages.NOTIFICACIONES
  ],
};

// --- INTERFACES DE SOPORTE ---
export interface Activity {
  id: string;
  type: 'payment' | 'enrollment' | 'report' | 'alert';
  title: string;
  subtitle: string;
  time: string;
}

export interface Student {
  id: string;
  name: string;
  category: string;
  attendance: string;
  attendancePercent: number;
  status: 'excelente' | 'regular';
}

export interface MetricCardProps {
  title: string;
  value: string;
  label: string;
  change?: string;
  icon: string;
  color: 'primary' | 'red' | 'teal' | 'orange';
}
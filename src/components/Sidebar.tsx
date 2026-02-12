import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, UserRole, ROLE_PERMISSIONS, AppPages } from '../types';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  user: User;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isDarkMode, toggleTheme, isOpen, onClose }) => {
  const navigate = useNavigate();

  // 1. Definición de rutas y etiquetas
  const allMenuItems = [
    { id: AppPages.DASHBOARD, label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { id: AppPages.ALUMNOS, label: 'Alumnos', icon: 'groups', path: '/alumnos' },
    { id: AppPages.EVALUACION, label: 'Evaluación', icon: 'checklist_rtl', path: '/evaluacion' },
    { id: AppPages.PAGOS, label: 'Pagos', icon: 'payments', path: '/pagos' },
    { id: AppPages.CALENDARIO, label: 'Calendario', icon: 'calendar_today', path: '/calendario' },
    { id: AppPages.RECORDATORIOS, label: 'Notificaciones', icon: 'notifications_active', path: '/notificaciones' },
    { id: AppPages.CONFIGURACION, label: 'Configuración', icon: 'settings', path: '/configuracion' },
  ];

  // 2. CORRECCIÓN DE PERMISOS: Si es DIRECTOR y no tiene permisos definidos, 
  // le asignamos temporalmente los mismos que al SUPER_ADMIN o ADMINISTRATIVO
  const allowedPages = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS[UserRole.ADMINISTRATIVO] || [];
  const menuItems = allMenuItems.filter(item => allowedPages.includes(item.id));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // 3. ACTUALIZACIÓN DE ETIQUETAS DE ROL
  const getRoleLabel = (role: UserRole) => {
    const labels: Record<string, string> = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.ADMINISTRATIVO]: 'Administrativo',
      [UserRole.ENTRENADOR]: 'Entrenador',
      [UserRole.DIRECTOR]: 'Director', // Agregamos la etiqueta para el nuevo rol
    };
    return labels[role] || 'Usuario';
  };

  return (
    <>
      {/* Overlay para móviles */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      <aside className={`w-72 lg:w-64 bg-white dark:bg-[#0a0f18] border-r border-slate-200 dark:border-white/5 flex flex-col fixed h-full z-50 transition-all duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo y Header */}
        <div className="p-6 flex flex-col items-center border-b border-slate-200 dark:border-white/5 relative">
          <button onClick={onClose} className="lg:hidden absolute top-4 right-4 text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
          <Logo className="w-16 h-16 mb-2" />
          <h1 className="font-black text-sm text-slate-900 dark:text-white tracking-tighter uppercase text-center">Club Deportivo Cezeus</h1>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary">Sistema Integral</h2>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  w-full flex items-center px-4 py-3 rounded-xl transition-all group
                  ${isActive 
                    ? 'bg-primary text-[#05080d] shadow-lg shadow-primary/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}
                `}
              >
                <span className="material-symbols-outlined mr-3 text-xl">{item.icon}</span>
                <span className="font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
              </NavLink>
            ))
          ) : (
            <div className="px-4 py-2 text-[10px] text-red-400 font-bold uppercase animate-pulse">
              Error de permisos: {user.role}
            </div>
          )}
        </nav>

        {/* Footer: Tema y Usuario */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-4 bg-white dark:bg-[#0a0f18]">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">{isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
            </div>
          </button>

          <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-[#05080d] font-black text-xs shadow-lg shadow-primary/20">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{user.name || 'Usuario'}</p>
              <p className="text-[9px] text-primary truncate uppercase font-bold tracking-widest">
                {getRoleLabel(user.role)}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
              title="Cerrar Sesión"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
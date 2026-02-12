import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { User } from '../types';

interface MainLayoutProps {
  user: User;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, isDarkMode, toggleTheme }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-cezeus-dark transition-colors duration-300">
      
      {/* Sidebar Fijo */}
      <Sidebar 
        user={user} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Contenido Principal */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        
        {/* Botón para abrir sidebar en móviles */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden mb-4 p-2 text-slate-600 dark:text-white bg-white dark:bg-cezeus-card rounded-lg shadow-sm dark:shadow-none border border-slate-200 dark:border-transparent"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* CAMBIO CLAVE: Añadimos 'context'. 
          Esto permite que cualquier página (Dashboard, Configuración, etc.) 
          pueda acceder a los datos del 'user' logueado.
        */}
        <div className="animate-in fade-in duration-500">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
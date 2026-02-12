import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import { useOutletContext } from 'react-router-dom';
import SeguimientoAlumno from '../components/SeguimientoAlumno';
import FormularioRegistroAlumno from '../components/FormularioRegistroAlumno';
import GestorCarnetDigital from '../components/GestorCarnetDigital';

const AlumnosModule: React.FC = () => {
  const context = useOutletContext<{ user: User }>() || {};
  const { user } = context;
  const [activeTab, setActiveTab] = useState<'LISTADO' | 'REGISTRO' | 'CARNET'>('LISTADO');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any>(null);

  const isAdmin = [UserRole.ADMINISTRATIVO, UserRole.DIRECTOR, UserRole.SUPER_ADMIN].includes(user?.role);
  const isAlumno = user?.role === UserRole.ALUMNO;

  // Si es alumno, enviarlo directo a su carnet
  useEffect(() => {
    if (isAlumno) setActiveTab('CARNET');
  }, [isAlumno]);

  return (
    <div className="space-y-6 pb-20">
      <nav className="flex flex-wrap gap-3 border-b border-white/5 pb-4 px-4">
        {!isAlumno && (
          <button onClick={() => setActiveTab('LISTADO')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'LISTADO' ? 'bg-primary text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            <span className="material-symbols-outlined text-sm">analytics</span> Seguimiento
          </button>
        )}
        {isAdmin && (
          <button onClick={() => setActiveTab('REGISTRO')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'REGISTRO' ? 'bg-primary text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            <span className="material-symbols-outlined text-sm">person_add</span> Registro
          </button>
        )}
        <button onClick={() => setActiveTab('CARNET')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'CARNET' ? 'bg-primary text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
          <span className="material-symbols-outlined text-sm">badge</span> {isAlumno ? 'Mi Carnet' : 'Carnet Digital'}
        </button>
      </nav>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'LISTADO' && !isAlumno && (
          <SeguimientoAlumno onSelectAlumno={(a: any) => { setAlumnoSeleccionado(a); setActiveTab('CARNET'); }} />
        )}
        {activeTab === 'REGISTRO' && isAdmin && <FormularioRegistroAlumno />}
        {activeTab === 'CARNET' && (
          <GestorCarnetDigital user={user} alumnoPreseleccionado={alumnoSeleccionado} />
        )}
      </div>
    </div>
  );
};

export default AlumnosModule;
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { User, UserRole } from './types';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Alumnos'; // Asegúrate de que el archivo se llame Alumnos.tsx en /pages
import Configuracion from './pages/Configuracion';

// Componentes de Estructura
import MainLayout from './components/MainLayout';

function App() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('nombre, rol')
        .eq('id', id)
        .single();

      if (error) throw error;

      setUser({
        id,
        email,
        name: data.nombre || 'Usuario',
        role: data.rol as UserRole,
      });
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A15] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#13ECEC] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(19,236,236,0.3)]"></div>
          <span className="text-[#13ECEC] text-[10px] font-black uppercase tracking-widest animate-pulse">Cargando Sistema...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA */}
        <Route 
          path="/" 
          element={!session ? <Login /> : <Navigate to="/dashboard" replace />} 
        />

        {/* RUTAS PRIVADAS */}
        {session && user ? (
          <Route element={
            <MainLayout 
              user={user} 
              isDarkMode={isDarkMode} 
              toggleTheme={toggleTheme} 
            />
          }>
            {/* Redirección inicial */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Módulos Principales */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alumnos" element={<Alumnos />} />
            <Route path="/configuracion" element={<Configuracion />} />

            {/* Módulos en construcción - Estilizados */}
            <Route path="/pagos" element={<PlaceholderSection title="Gestión de Pagos" />} />
            <Route path="/evaluacion" element={<PlaceholderSection title="Evaluaciones Técnicas" />} />
            <Route path="/calendario" element={<PlaceholderSection title="Calendario de Entrenamientos" />} />
            
            {/* Catch-all dentro de autenticados */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

// Componente auxiliar para rutas no implementadas aún
const PlaceholderSection = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center animate-bounce">
      <span className="material-symbols-outlined text-primary text-3xl">construction</span>
    </div>
    <div className="text-center">
      <h3 className="dark:text-white text-slate-800 font-black uppercase italic text-xl">{title}</h3>
      <p className="dark:text-slate-500 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Módulo bajo desarrollo técnico</p>
    </div>
  </div>
);

export default App;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- RECUPERACIÓN DE CONTRASEÑA ---
  const handleResetPassword = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setError('Por favor, ingresa tu correo electrónico primero.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccessMessage('¡Listo! Revisa tu bandeja de entrada.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // --- INICIO DE SESIÓN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Autenticación con Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Consultar el perfil para obtener el ROL
        const { data: perfil, error: perfilError } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', authData.user.id)
          .single();

        // Si hay error en el perfil, cerramos sesión por seguridad para no dejar un usuario "roto"
        if (perfilError || !perfil) {
          await supabase.auth.signOut();
          throw new Error('Tu cuenta no tiene un perfil asignado. Contacta al administrador.');
        }

        // 3. Navegación inteligente
        console.log("Sesión iniciada como:", perfil.rol);
        
        // Redirigimos a todos al dashboard por ahora (puedes añadir lógica por rol aquí)
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Traducimos errores comunes para el usuario
      const msg = err.message === 'Invalid login credentials' 
        ? 'Correo o contraseña incorrectos.' 
        : err.message;
      setError(msg || 'Error inesperado al ingresar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cezeus-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Fondo Decorativo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-primary/20 rounded-full animate-pulse"></div>
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-cezeus-card/50 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <Logo className="w-20 h-20 mb-4" />
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase leading-tight">
              Club Deportivo <span className="text-primary">Cezeus</span>
            </h1>
            <p className="text-primary/80 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">Gestión Deportiva</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-600"
                placeholder="ejemplo@cezeus.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-in slide-in-from-top-1">
                <p className="text-red-400 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>
              </div>
            )}
            
            {successMessage && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 animate-in slide-in-from-top-1">
                <p className="text-primary text-[10px] font-bold text-center uppercase tracking-widest">{successMessage}</p>
              </div>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-cezeus-dark font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-cezeus-dark border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">
            <button 
              type="button"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-primary transition-colors"
              onClick={handleResetPassword}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
        <p className="text-center text-slate-600 text-[9px] mt-8 font-black uppercase tracking-[0.2em]">
          Powered by Club Deportivo Cezeus © 2026
        </p>
      </div>
    </div>
  );
};

export default Login;
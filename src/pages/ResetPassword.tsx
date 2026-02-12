import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.');
      setTimeout(() => window.location.href = '/', 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cezeus-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-cezeus-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16 mb-4" />
          <h2 className="text-xl font-black text-white uppercase">Nueva Contraseña</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <input 
            required
            type="password" 
            placeholder="Escribe tu nueva clave"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-primary outline-none"
          />
          <button 
            disabled={loading}
            className="w-full bg-primary text-cezeus-dark font-black py-4 rounded-2xl uppercase tracking-widest text-sm"
          >
            {loading ? 'Actualizando...' : 'Guardar Contraseña'}
          </button>
        </form>
        {message && <p className="mt-4 text-primary text-[10px] font-bold text-center uppercase">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
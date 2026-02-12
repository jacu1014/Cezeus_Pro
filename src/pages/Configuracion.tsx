import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserRole, Perfil, User } from '../types';
import { useUsuarios } from '../hooks/useUsuarios';
import { exportarUsuariosPDF } from '../lib/exportUtils';

const EPS_COLOMBIA = [
  "Sura", "Sanitas", "Salud Total", "Nueva EPS", "Compensar", 
  "Coosalud", "Mutual Ser", "Famisanar", "Aliansalud", "Ecopetrol",
  "Capresoca", "Capital Salud", "Cajacopi", "Asmet Salud", "Emsanar",
  "Pijaos Salud", "Saviasalud", "Ferrocarriles Nacionales", "Especial"
].sort();

const Configuracion: React.FC = () => {
  const context = useOutletContext<{ user: User }>() || {};
  const currentUser = context.user;
  
  const { 
    usuarios, loading, fetching, mensaje, 
    registrarUsuario, actualizarUsuario, eliminarUsuario, resetPassword 
  } = useUsuarios();

  const initialForm = {
    nombre: '', segundo_nombre: '', primer_apellido: '', segundo_apellido: '',
    email: '', password: '', rol: UserRole.ENTRENADOR, fecha_nacimiento: '',
    telefono: '', tipo_documento: 'Cédula de Ciudadanía', numero_documento: '',
    grupo_sanguineo: 'O', factor_rh: '+', eps: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFiltro, setRolFiltro] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState<Perfil | null>(null);

  if (!currentUser) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-primary font-black animate-pulse uppercase tracking-widest text-xs">
          Cargando configuración de seguridad...
        </div>
      </div>
    );
  }

  const ROLES_DISPONIBLES = [
    { label: 'Entrenador', value: UserRole.ENTRENADOR },
    { label: 'Administrativo', value: UserRole.ADMINISTRATIVO },
    { label: 'Director', value: UserRole.DIRECTOR },
    { label: 'Super Admin', value: UserRole.SUPER_ADMIN }
  ].filter(opt => {
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      return opt.value !== UserRole.SUPER_ADMIN;
    }
    return true;
  });

  const usuariosFiltrados = usuarios.filter(u => {
    const term = searchTerm.toLowerCase();
    const nombreFull = [u.primer_apellido, u.nombre, u.numero_documento]
      .some(field => field?.toLowerCase().includes(term));
    const matchesRol = rolFiltro === 'TODOS' || u.rol === rolFiltro;
    return nombreFull && matchesRol;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const exito = await registrarUsuario(formData);
    if (exito) setFormData(initialForm);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioAEditar) return;
    const exito = await actualizarUsuario(usuarioAEditar);
    if (exito) {
        setIsModalOpen(false);
        setUsuarioAEditar(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">
            Configuración <span className="text-primary">Personal</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gestión de seguridad y staff</p>
        </div>
        {mensaje && (
          <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase border animate-pulse ${
            mensaje.tipo === 'success' ? 'bg-primary/20 text-primary border-primary/20' : 'bg-red-500/20 text-red-400 border-red-500/20'
          }`}>
            {mensaje.texto}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* PANEL DE REGISTRO */}
        <div className="xl:col-span-4">
          <div className="bg-[#0a0f18]/40 border border-white/5 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
            <h2 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_add</span> Nuevo Ingreso
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InputSimple label="1er Apellido *" value={formData.primer_apellido} onChange={(v:any) => setFormData({...formData, primer_apellido: v})} required />
                <InputSimple label="2do Apellido" value={formData.segundo_apellido} onChange={(v:any) => setFormData({...formData, segundo_apellido: v})} />
                <InputSimple label="1er Nombre *" value={formData.nombre} onChange={(v:any) => setFormData({...formData, nombre: v})} required />
                <InputSimple label="2do Nombre" value={formData.segundo_nombre} onChange={(v:any) => setFormData({...formData, segundo_nombre: v})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectSimple label="Tipo Doc" value={formData.tipo_documento} options={['Cédula de Ciudadanía', 'Cédula de Extranjería', 'Pasaporte']} onChange={(v:any) => setFormData({...formData, tipo_documento: v})} />
                <InputSimple label="N° Documento *" minLength={10} value={formData.numero_documento} onChange={(v:any) => setFormData({...formData, numero_documento: v})} required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <SelectSimple label="GS" value={formData.grupo_sanguineo} options={['A', 'B', 'AB', 'O']} onChange={(v:any) => setFormData({...formData, grupo_sanguineo: v})} />
                <SelectSimple label="RH" value={formData.factor_rh} options={['+', '-']} onChange={(v:any) => setFormData({...formData, factor_rh: v})} />
                <InputSimple label="Nacimiento" type="date" value={formData.fecha_nacimiento} onChange={(v:any) => setFormData({...formData, fecha_nacimiento: v})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectSimple label="EPS" value={formData.eps} options={EPS_COLOMBIA} onChange={(v:any) => setFormData({...formData, eps: v})} />
                <InputSimple label="Teléfono *" type="tel" minLength={10} pattern="[0-9]*" value={formData.telefono} onChange={(v:any) => setFormData({...formData, telefono: v})} required />
              </div>
              <div className="pt-4 border-t border-white/5 space-y-3">
                <InputSimple label="Email Acceso *" type="email" value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} required />
                <div className="grid grid-cols-2 gap-3">
                  <InputSimple label="Contraseña *" type="password" value={formData.password} onChange={(v:any) => setFormData({...formData, password: v})} required />
                  <SelectSimple label="Rol *" value={formData.rol} options={ROLES_DISPONIBLES.map(r => r.value)} onChange={(v:any) => setFormData({...formData, rol: v as UserRole})} />
                </div>
              </div>
              <button disabled={loading} className="w-full bg-primary text-black font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:brightness-110 transition-all mt-4">
                {loading ? 'PROCESANDO...' : 'GUARDAR'}
              </button>
            </form>
          </div>
        </div>

        {/* LISTADO Y FILTROS */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-xl">search</span>
              <input type="text" placeholder="BUSCAR POR NOMBRE O CC..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0f18]/60 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/40 transition-all backdrop-blur-md" />
            </div>
            <button onClick={() => exportarUsuariosPDF(usuariosFiltrados)} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-primary hover:bg-primary hover:text-black transition-all">
                <span className="material-symbols-outlined">download</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['TODOS', ...ROLES_DISPONIBLES.map(r => r.value)].map((rol) => {
              const count = rol === 'TODOS' 
                ? usuarios.length 
                : usuarios.filter(u => u.rol === rol).length;
              
              return (
                <button 
                  key={rol} 
                  onClick={() => setRolFiltro(rol)}
                  className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap flex items-center gap-2 ${
                    rolFiltro === rol 
                      ? 'bg-primary text-black border-primary' 
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {rol}
                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${
                    rolFiltro === rol ? 'bg-black/20 text-black' : 'bg-primary/20 text-primary'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-[#0a0f18]/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Miembro Staff</th>
                  <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Rol</th>
                  <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">EPS</th>
                  <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-6 py-5 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {fetching ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center text-[10px] font-black text-slate-500 uppercase animate-pulse">Sincronizando...</td></tr>
                ) : usuariosFiltrados.map((u) => {
                  
                  // Lógica de concatenación solicitada: Apellidos + Nombres (sin espacios si están vacíos)
                  const nombreCompleto = [
                    u.primer_apellido,
                    u.segundo_apellido,
                    u.nombre,
                    u.segundo_nombre
                  ].filter(field => field && field.trim() !== "").join(' ');

                  // Lógica de verificación: Se considera listo si tiene Teléfono y EPS
                  const isVerified = u.telefono && u.eps && u.telefono.length >= 7;

                  return (
                    <tr key={u.id} className="group hover:bg-white/[0.01] transition-all">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-primary border border-white/5 uppercase">
                              {u.nombre?.[0] || '?'}{u.primer_apellido?.[0] || '?'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase group-hover:text-primary transition-colors leading-none mb-1">
                              {nombreCompleto}
                            </span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                              {u.numero_documento} • {u.telefono || 'SIN TELÉFONO'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[8px] font-black px-2 py-1 rounded-md border uppercase tracking-widest ${
                          u.rol === UserRole.DIRECTOR ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          u.rol === UserRole.SUPER_ADMIN ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                          u.rol === UserRole.ADMINISTRATIVO ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                          {u.eps || 'No asignada'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border ${
                          isVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          <span className="material-symbols-outlined text-sm">
                            {isVerified ? 'verified' : 'pending'}
                          </span>
                          <span className="text-[8px] font-black uppercase">
                            {isVerified ? 'Verificado' : 'Pendiente'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {currentUser.role === UserRole.SUPER_ADMIN && (
                             <button onClick={() => resetPassword(u.email || '')} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 hover:text-amber-500 transition-colors" title="Resetear Clave">
                               <span className="material-symbols-outlined text-[16px]">key</span>
                             </button>
                          )}
                          {(currentUser.role === UserRole.SUPER_ADMIN || u.rol !== UserRole.SUPER_ADMIN) && (
                            <button onClick={() => { setUsuarioAEditar(u); setIsModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 hover:text-primary transition-colors" title="Editar">
                              <span className="material-symbols-outlined text-[16px]">edit_note</span>
                            </button>
                          )}
                          {currentUser.role === UserRole.SUPER_ADMIN && (
                            <button onClick={() => eliminarUsuario(u.id, u.nombre)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL EDITAR */}
      {isModalOpen && usuarioAEditar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#0a0f18] border border-white/10 w-full max-w-3xl rounded-[3rem] p-6 md:p-10 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><span className="material-symbols-outlined">close</span></button>

            <h2 className="text-xl font-black text-white uppercase mb-8 italic">
              Editar Staff: <span className="text-primary">{usuarioAEditar.nombre} {usuarioAEditar.primer_apellido}</span>
            </h2>

            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InputSimple label="1er Apellido *" value={usuarioAEditar.primer_apellido} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, primer_apellido: v})} required />
                <InputSimple label="2do Apellido" value={usuarioAEditar.segundo_apellido} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, segundo_apellido: v})} />
                <InputSimple label="1er Nombre *" value={usuarioAEditar.nombre} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, nombre: v})} required />
                <InputSimple label="2do Nombre" value={usuarioAEditar.segundo_nombre} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, segundo_nombre: v})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectSimple label="Tipo Doc" value={usuarioAEditar.tipo_documento} options={['Cédula de Ciudadanía', 'Cédula de Extranjería', 'Pasaporte']} onChange={(v:any) => setUsuarioAEditar({...usuarioAEditar, tipo_documento: v})} />
                <InputSimple label="N° Documento *" minLength={10} value={usuarioAEditar.numero_documento} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, numero_documento: v})} required />
                <SelectSimple label="Rol en Club *" value={usuarioAEditar.rol} options={ROLES_DISPONIBLES.map(r => r.value)} onChange={(v:any) => setUsuarioAEditar({...usuarioAEditar, rol: v as UserRole})} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SelectSimple label="GS" value={usuarioAEditar.grupo_sanguineo} options={['A', 'B', 'AB', 'O']} onChange={(v:any) => setUsuarioAEditar({...usuarioAEditar, grupo_sanguineo: v})} />
                <SelectSimple label="RH" value={usuarioAEditar.factor_rh} options={['+', '-']} onChange={(v:any) => setUsuarioAEditar({...usuarioAEditar, factor_rh: v})} />
                <InputSimple label="Nacimiento" type="date" value={usuarioAEditar.fecha_nacimiento} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, fecha_nacimiento: v})} />
                <SelectSimple label="EPS" value={usuarioAEditar.eps} options={EPS_COLOMBIA} onChange={(v:any) => setUsuarioAEditar({...usuarioAEditar, eps: v})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputSimple label="Teléfono *" type="tel" minLength={10} pattern="[0-9]*" value={usuarioAEditar.telefono} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, telefono: v})} required />
                <div className="flex flex-col gap-1 opacity-60 cursor-not-allowed">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Email (Protegido)</label>
                  <div className="bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-slate-400 text-[11px] w-full">{usuarioAEditar.email}</div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary text-black font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:brightness-110 transition-all">
                {loading ? 'SINCRONIZANDO...' : 'ACTUALIZAR DATOS'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InputSimple = ({ label, value, onChange, type = "text", required = false, minLength, pattern }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">{label}</label>
    <input 
      type={type} 
      required={required} 
      minLength={minLength}
      pattern={pattern}
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-primary outline-none text-[11px] w-full" 
    />
  </div>
);

const SelectSimple = ({ label, value, options, onChange }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">{label}</label>
    <div className="relative">
      <select 
        className="bg-slate-900 border border-white/5 rounded-xl p-3 text-[11px] text-white outline-none w-full appearance-none pr-10" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Seleccionar...</option>
        {options.map((opt: string) => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
      </select>
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm">expand_more</span>
    </div>
  </div>
);

export default Configuracion;
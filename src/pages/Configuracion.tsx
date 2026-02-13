import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserRole, Perfil, User } from '../types';
import { useUsuarios } from '../hooks/useUsuarios';
import { generarReporteCEZEUS } from '../services/reportePDFService';

// --- IMPORTACIÓN DE CONSTANTES DESDE DATA.TS ---
import { 
  EPS_COLOMBIA, 
  TIPOS_DOCUMENTO, 
  GRUPOS_RH, 
  FACTORES_RH 
} from '../constants/data';

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
    telefono: '', tipo_documento: TIPOS_DOCUMENTO[2], // Default: Cédula de Ciudadanía
    numero_documento: '',
    grupo_sanguineo: GRUPOS_RH[0], 
    factor_rh: FACTORES_RH[0], 
    eps: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFiltro, setRolFiltro] = useState<string>('TODOS');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
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

  const handleExportarPDF = () => {
    const columnas = [
      { header: 'DOCUMENTO', dataKey: 'doc' },
      { header: 'NOMBRE COMPLETO', dataKey: 'nombre' },
      { header: 'ROL', dataKey: 'rol' },
      { header: 'EPS', dataKey: 'eps' },
      { header: 'ESTADO', dataKey: 'estado' }
    ];

    const datos = usuariosFiltrados.map(u => ({
      doc: u.numero_documento,
      nombre: `${u.primer_apellido} ${u.segundo_apellido || ''} ${u.nombre} ${u.segundo_nombre || ''}`.replace(/\s+/g, ' ').trim().toUpperCase(),
      rol: u.rol,
      eps: u.eps || 'NO ASIGNADA',
      estado: (u.telefono && u.eps) ? 'VERIFICADO' : 'PENDIENTE'
    }));

    generarReporteCEZEUS("Listado de Staff y Seguridad", datos, columnas);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const exito = await registrarUsuario(formData);
    if (exito) {
        setFormData(initialForm);
        setIsRegisterModalOpen(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioAEditar) return;
    const exito = await actualizarUsuario(usuarioAEditar);
    if (exito) {
        setIsEditModalOpen(false);
        setUsuarioAEditar(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-4 max-w-[1600px] mx-auto">
      {/* HEADER PRINCIPAL */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
            Configuración <span className="text-primary">Personal</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 ml-1">Gestión de staff y control de accesos</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            {mensaje && (
                <div className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase border animate-in slide-in-from-top-2 ${
                    mensaje.tipo === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                    {mensaje.texto}
                </div>
            )}
            <button 
                onClick={() => setIsRegisterModalOpen(true)}
                className="bg-primary text-black px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Nuevo Registro
            </button>
            <button onClick={handleExportarPDF} className="bg-white/5 border border-white/10 p-3.5 rounded-2xl text-primary hover:bg-primary hover:text-black transition-all group">
                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">download</span>
            </button>
        </div>
      </header>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="space-y-6">
          <div className="flex flex-col xl:flex-row gap-6 items-center">
            <div className="relative flex-1 group w-full">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-xl">search</span>
              <input type="text" placeholder="BUSCAR POR NOMBRE O DOCUMENTO..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0f18]/60 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/40 transition-all backdrop-blur-md" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full xl:w-auto">
                {['TODOS', ...ROLES_DISPONIBLES.map(r => r.value)].map((rol) => {
                const count = rol === 'TODOS' ? usuarios.length : usuarios.filter(u => u.rol === rol).length;
                const getRolStyle = (r: string) => {
                    if (r === UserRole.DIRECTOR) return 'border-amber-500/20 text-amber-400';
                    if (r === UserRole.SUPER_ADMIN) return 'border-purple-500/20 text-purple-400';
                    if (r === UserRole.ADMINISTRATIVO) return 'border-blue-500/20 text-blue-400';
                    return 'border-primary/20 text-primary';
                };

                return (
                    <button key={rol} onClick={() => setRolFiltro(rol)}
                    className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap flex items-center gap-3 ${
                        rolFiltro === rol ? 'bg-primary text-black border-primary shadow-lg shadow-primary/10' : `bg-white/5 hover:bg-white/10 ${getRolStyle(rol)}`
                    }`}>
                    {rol}
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${rolFiltro === rol ? 'bg-black/20 text-black' : 'bg-white/5 text-slate-500'}`}>
                        {count}
                    </span>
                    </button>
                );
                })}
            </div>
          </div>

          {/* TABLA DE STAFF */}
          <div className="bg-[#0a0f18]/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                <thead className="bg-white/5">
                    <tr>
                    <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Miembro Staff</th>
                    <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Rol</th>
                    <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">EPS</th>
                    <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
                    <th className="px-8 py-6 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                    {fetching ? (
                    <tr><td colSpan={5} className="px-8 py-24 text-center text-[10px] font-black text-slate-500 uppercase animate-pulse">Sincronizando staff con servidor...</td></tr>
                    ) : usuariosFiltrados.map((u) => {
                    const nombreCompleto = [u.primer_apellido, u.segundo_apellido, u.nombre, u.segundo_nombre].filter(f => f?.trim()).join(' ');
                    const isVerified = u.telefono && u.eps && u.telefono.length >= 7;

                    return (
                        <tr key={u.id} className="group hover:bg-white/[0.01] transition-all">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-[11px] font-black text-primary border border-white/5 uppercase shadow-inner">
                                {u.nombre?.[0] || '?'}{u.primer_apellido?.[0] || '?'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[12px] font-black text-white uppercase group-hover:text-primary transition-colors leading-none mb-1.5">
                                {nombreCompleto}
                                </span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <span className="text-slate-600">{u.numero_documento}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                <span>{u.telefono || 'SIN TELÉFONO'}</span>
                                </span>
                            </div>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <span className={`text-[8px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${
                            u.rol === UserRole.DIRECTOR ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            u.rol === UserRole.SUPER_ADMIN ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                            u.rol === UserRole.ADMINISTRATIVO ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            'bg-primary/10 text-primary border-primary/20'
                            }`}>
                            {u.rol}
                            </span>
                        </td>
                        <td className="px-8 py-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase italic tracking-wide">
                            {u.eps || 'No asignada'}
                            </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                            isVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                            <span className="material-symbols-outlined text-[14px]">
                                {isVerified ? 'verified' : 'pending'}
                            </span>
                            <span className="text-[9px] font-black uppercase">
                                {isVerified ? 'Verificado' : 'Pendiente'}
                            </span>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {currentUser.role === UserRole.SUPER_ADMIN && (
                                <button onClick={() => resetPassword(u.email || '')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 hover:text-amber-500 transition-colors border border-white/5" title="Resetear Clave">
                                <span className="material-symbols-outlined text-[18px]">key</span>
                                </button>
                            )}
                            <button onClick={() => { setUsuarioAEditar(u); setIsEditModalOpen(true); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 hover:text-primary transition-colors border border-white/5" title="Editar">
                                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                            </button>
                            {currentUser.role === UserRole.SUPER_ADMIN && (
                                <button onClick={() => eliminarUsuario(u.id, u.nombre)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 hover:text-red-500 transition-colors border border-white/5" title="Eliminar">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
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

      {/* MODAL REGISTRO STAFF */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#0a0f18] border border-white/10 w-full max-w-4xl rounded-[3rem] p-8 md:p-12 relative max-h-[90vh] overflow-y-auto shadow-2xl">
                <button onClick={() => setIsRegisterModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-3xl">close</span>
                </button>

                <div className="mb-10">
                    <h2 className="text-2xl font-black text-white uppercase italic flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-3xl">person_add</span>
                        Nuevo <span className="text-primary">Ingreso Staff</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Habilita accesos para el nuevo miembro del equipo</p>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <InputSimple label="1er Apellido *" value={formData.primer_apellido} onChange={(v:any) => setFormData({...formData, primer_apellido: v})} required />
                        <InputSimple label="2do Apellido" value={formData.segundo_apellido} onChange={(v:any) => setFormData({...formData, segundo_apellido: v})} />
                        <InputSimple label="1er Nombre *" value={formData.nombre} onChange={(v:any) => setFormData({...formData, nombre: v})} required />
                        <InputSimple label="2do Nombre" value={formData.segundo_nombre} onChange={(v:any) => setFormData({...formData, segundo_nombre: v})} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <SelectSimple label="Tipo Documento" value={formData.tipo_documento} options={TIPOS_DOCUMENTO} onChange={(v:any) => setFormData({...formData, tipo_documento: v})} />
                        <InputSimple label="N° Documento *" minLength={10} value={formData.numero_documento} onChange={(v:any) => setFormData({...formData, numero_documento: v})} required />
                        <SelectSimple label="Rol Asignado *" value={formData.rol} options={ROLES_DISPONIBLES.map(r => r.value)} onChange={(v:any) => setFormData({...formData, rol: v as UserRole})} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <SelectSimple label="G. Sanguíneo" value={formData.grupo_sanguineo} options={GRUPOS_RH} onChange={(v:any) => setFormData({...formData, grupo_sanguineo: v})} />
                        <SelectSimple label="Factor RH" value={formData.factor_rh} options={FACTORES_RH} onChange={(v:any) => setFormData({...formData, factor_rh: v})} />
                        <InputSimple label="Fecha Nacimiento" type="date" value={formData.fecha_nacimiento} onChange={(v:any) => setFormData({...formData, fecha_nacimiento: v})} />
                        <SelectSimple label="EPS" value={formData.eps} options={EPS_COLOMBIA} onChange={(v:any) => setFormData({...formData, eps: v})} />
                    </div>

                    <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-5">
                        <InputSimple label="Teléfono de Contacto *" type="tel" minLength={10} value={formData.telefono} onChange={(v:any) => setFormData({...formData, telefono: v})} required />
                        <InputSimple label="Email Acceso *" type="email" value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} required />
                        <InputSimple label="Contraseña Temporal *" type="password" value={formData.password} onChange={(v:any) => setFormData({...formData, password: v})} required />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors">Cancelar</button>
                        <button disabled={loading} className="bg-primary text-black font-black px-12 py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:brightness-110 transition-all shadow-xl shadow-primary/20">
                            {loading ? 'REGISTRANDO...' : 'GUARDAR MIEMBRO'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL EDITAR PERFIL */}
      {isEditModalOpen && usuarioAEditar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0a0f18] border border-white/10 w-full max-w-4xl rounded-[3rem] p-8 md:p-12 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            <div className="mb-10">
                <h2 className="text-2xl font-black text-white uppercase italic">
                    Actualizar Perfil: <span className="text-primary">{usuarioAEditar.nombre} {usuarioAEditar.primer_apellido}</span>
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Sincronización en tiempo real con base de datos</p>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <InputSimple label="1er Apellido *" value={usuarioAEditar.primer_apellido} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, primer_apellido: v})} required />
                <InputSimple label="2do Apellido" value={usuarioAEditar.segundo_apellido} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, segundo_apellido: v})} />
                <InputSimple label="1er Nombre *" value={usuarioAEditar.nombre} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, nombre: v})} required />
                <InputSimple label="2do Nombre" value={usuarioAEditar.segundo_nombre} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, segundo_nombre: v})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <SelectSimple label="Tipo Documento" value={usuarioAEditar.tipo_documento} options={TIPOS_DOCUMENTO} onChange={(v:any) => setUsuarioAEditar({...usuarioAEditar, tipo_documento: v})} />
                <InputSimple label="N° Documento *" minLength={10} value={usuarioAEditar.numero_documento} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, numero_documento: v})} required />
                <SelectSimple label="Rol en Club *" value={usuarioAEditar.rol} options={ROLES_DISPONIBLES.map(r => r.value)} onChange={(v:any) => setUsuarioAEditar({...usuarioAEditar, rol: v as UserRole})} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <SelectSimple label="G. Sanguíneo" value={usuarioAEditar.grupo_sanguineo} options={GRUPOS_RH} onChange={(v:any) => setUsuarioAEditar({...usuarioAEditar, grupo_sanguineo: v})} />
                <SelectSimple label="Factor RH" value={usuarioAEditar.factor_rh} options={FACTORES_RH} onChange={(v:any) => setUsuarioAEditar({...usuarioAEditar, factor_rh: v})} />
                <InputSimple label="Nacimiento" type="date" value={usuarioAEditar.fecha_nacimiento} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, fecha_nacimiento: v})} />
                <SelectSimple label="EPS" value={usuarioAEditar.eps} options={EPS_COLOMBIA} onChange={(v:any) => setUsuarioAEditar({...usuarioAEditar, eps: v})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-8 border-t border-white/5">
                <InputSimple label="Teléfono *" type="tel" minLength={10} value={usuarioAEditar.telefono} onChange={(v:string) => setUsuarioAEditar({...usuarioAEditar, telefono: v})} required />
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest italic">Email de Acceso (Protegido)</label>
                  <div className="bg-slate-900/80 border border-white/10 rounded-2xl py-4 px-5 text-slate-500 text-[11px] font-bold w-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    {usuarioAEditar.email}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase text-slate-400">Descartar</button>
                <button type="submit" disabled={loading} className="bg-primary text-black font-black px-12 py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:brightness-110 transition-all shadow-xl shadow-primary/20">
                    {loading ? 'SINCRO...' : 'ACTUALIZAR DATOS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InputSimple = ({ label, value, onChange, type = "text", required = false, minLength, pattern }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest italic">{label}</label>
    <input 
      type={type} 
      required={required} 
      minLength={minLength}
      pattern={pattern}
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-5 text-white focus:ring-1 focus:ring-primary/50 outline-none text-[11px] w-full transition-all hover:bg-slate-900" 
    />
  </div>
);

const SelectSimple = ({ label, value, options, onChange }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest italic">{label}</label>
    <div className="relative group">
      <select 
        className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-[11px] text-white outline-none w-full appearance-none pr-10 transition-all hover:bg-slate-900" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" className="bg-slate-950 text-slate-500">Seleccionar...</option>
        {options.map((opt: string) => <option key={opt} value={opt} className="bg-slate-950">{opt}</option>)}
      </select>
      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-xl group-hover:text-primary transition-colors">expand_more</span>
    </div>
  </div>
);

export default Configuracion;
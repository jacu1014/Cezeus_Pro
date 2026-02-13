import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
// IMPORTACIÓN DE VARIABLES CENTRALIZADAS
import { EPS_COLOMBIA, TIPOS_DOCUMENTO, GRUPOS_RH, FACTORES_RH, PARENTESCOS } from '../constants/data';

const FormularioRegistroAlumno: React.FC = () => {
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  
  // Estados de control para limpieza manual
  const [parentesco, setParentesco] = useState('');
  const [otroParentesco, setOtroParentesco] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [categoriaAuto, setCategoriaAuto] = useState('Esperando fecha...');
  const [contacto1, setContacto1] = useState('');
  const [contacto2, setContacto2] = useState('');
  const [loading, setLoading] = useState(false);

  const mostrarMensaje = (texto: string, tipo: 'success' | 'error') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const calcularCategoria = (fechaISO: string) => {
    if (!fechaISO) return;
    const fechaNac = new Date(fechaISO);
    fechaNac.setMinutes(fechaNac.getMinutes() + fechaNac.getTimezoneOffset());
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) edad--;

    if (edad >= 5 && edad <= 7) setCategoriaAuto('Iniciación (5-7 años)');
    else if (edad >= 8 && edad <= 10) setCategoriaAuto('Infantil (8-10 años)');
    else if (edad > 10 && edad <= 13) setCategoriaAuto('Transición (11-13 años)');
    else if (edad < 5) setCategoriaAuto('Menor de 5 años');
    else setCategoriaAuto('Categoría Superior (14+)');
  };

  const registrarAlumno = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const fotoArchivo = fileInputRef.current?.files?.[0];

      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { role: 'Alumno' },
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Error al crear credenciales.");

      // 2. Subir Foto y obtener URL pública ANTES del insert
      let publicUrlFinal = null;
      if (fotoArchivo) {
        const fileExt = fotoArchivo.name.split('.').pop();
        const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `perfiles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('Fotos_Alumnos')
          .upload(filePath, fotoArchivo);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('Fotos_Alumnos')
            .getPublicUrl(filePath);
          publicUrlFinal = urlData.publicUrl;
        } else {
          console.error("Error al subir imagen:", uploadError.message);
          // Opcional: podrías decidir si lanzar error o continuar sin foto
        }
      }

      // 3. Insertar en Tabla Alumnos con la URL confirmada y datos normalizados
      const { error: dbError } = await supabase.from('alumnos').insert([{
        id: authData.user.id,
        primer_apellido: (formData.get('p_apellido') as string)?.toUpperCase(),
        segundo_apellido: (formData.get('s_apellido') as string)?.toUpperCase(),
        primer_nombre: (formData.get('p_nombre') as string)?.toUpperCase(),
        segundo_nombre: (formData.get('s_nombre') as string)?.toUpperCase(),
        tipo_documento: formData.get('t_doc'),
        numero_documento: formData.get('n_doc'),
        fecha_nacimiento: fechaNacimiento,
        categoria: categoriaAuto,
        email: email,
        rol: 'Alumno',
        estado: 'ACTIVO', // Normalizado en mayúsculas
        eps: formData.get('eps'),
        rh_grupo: formData.get('rh_g'),
        rh_factor: formData.get('rh_f'),
        acudiente_primer_apellido: (formData.get('a_p_apellido') as string)?.toUpperCase(),
        acudiente_segundo_apellido: (formData.get('a_s_apellido') as string)?.toUpperCase(),
        acudiente_primer_nombre: (formData.get('a_p_nombre') as string)?.toUpperCase(),
        acudiente_segundo_nombre: (formData.get('a_s_nombre') as string)?.toUpperCase(),
        acudiente_parentesco: parentesco === 'Otro' ? otroParentesco : parentesco,
        contacto_1: contacto1,
        contacto_2: contacto2,
        condiciones_medicas: formData.get('medicos'),
        foto_url: publicUrlFinal // Ahora sí llega con valor al Insert
      }]);

      if (dbError) throw dbError;

      mostrarMensaje("✨ Alumno registrado con éxito", "success");
      
      // Limpieza de formulario y estados
      form.reset(); 
      setFotoPreview(null);
      setFechaNacimiento('');
      setCategoriaAuto('Esperando fecha...');
      setParentesco('');
      setOtroParentesco('');
      setContacto1('');
      setContacto2('');
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err: any) {
      console.error("Error en el proceso:", err);
      mostrarMensaje(err.message || "Error inesperado", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 relative">
      {mensaje && (
        <div className={`fixed top-10 right-10 z-50 animate-in fade-in slide-in-from-right-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${
          mensaje.tipo === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <span className="material-symbols-outlined">{mensaje.tipo === 'success' ? 'check_circle' : 'error'}</span>
          <p className="text-[10px] font-black uppercase tracking-widest">{mensaje.texto}</p>
        </div>
      )}

      <div className="bg-[#0a0f18]/60 border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl">
        <form className="space-y-12" onSubmit={registrarAlumno}>
          <section className="space-y-8">
            <h3 className="text-primary font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2 italic">
              <span className="material-symbols-outlined text-sm">person</span> Datos del Alumno
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-3 flex flex-col items-center gap-3">
                <div onClick={() => fileInputRef.current?.click()} className="w-44 h-52 bg-slate-900 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative group">
                  {fotoPreview ? <img src={fotoPreview} className="w-full h-full object-cover" alt="Preview" /> : <span className="material-symbols-outlined text-slate-600 text-4xl">add_a_photo</span>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic text-center">Foto (JPG/PNG)</span>
              </div>
              <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="p_apellido" label="* Primer Apellido" required />
                <Input name="s_apellido" label="Segundo Apellido" />
                <Input name="p_nombre" label="* Primer Nombre" required />
                <Input name="s_nombre" label="Segundo Nombre" />
                <Select name="t_doc" label="* Tipo Documento" options={TIPOS_DOCUMENTO} required />
                <Input name="n_doc" label="* Número Documento" required />
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[9px] font-black text-primary uppercase ml-1 tracking-widest">Categoría Automática</label>
                  <div className="bg-primary/5 border border-primary/20 rounded-xl py-3.5 px-4 text-primary font-bold text-[11px] w-full italic">{categoriaAuto}</div>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">* Fecha Nacimiento</label>
                  <input type="date" value={fechaNacimiento} onChange={(e) => {setFechaNacimiento(e.target.value); calcularCategoria(e.target.value);}} required className="bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-primary outline-none text-[11px] w-full [color-scheme:dark]" />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-primary font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2 italic">
              <span className="material-symbols-outlined text-sm">lock</span> Credenciales de Acceso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-6 rounded-[2rem] border border-white/5">
              <Input name="email" type="email" label="* Correo (Usuario)" required />
              <Input name="password" type="password" label="* Contraseña Inicial" required />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-primary font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2 italic">
              <span className="material-symbols-outlined text-sm">family_restroom</span> Datos del Acudiente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input name="a_p_apellido" label="* Primer Apellido" required />
              <Input name="a_s_apellido" label="Segundo Apellido" />
              <Input name="a_p_nombre" label="* Primer Nombre" required />
              <Input name="a_s_nombre" label="Segundo Nombre" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Select 
                  label="* Parentesco" 
                  value={parentesco} 
                  options={PARENTESCOS} 
                  required 
                  onChange={(e: any) => setParentesco(e.target.value)} 
                />
                {parentesco === 'Otro' && (
                  <input type="text" placeholder="¿Cuál?" value={otroParentesco} onChange={(e) => setOtroParentesco(e.target.value)} className="w-full bg-primary/10 border border-primary/20 rounded-xl py-2 px-4 text-[11px] text-white outline-none animate-in fade-in" required />
                )}
              </div>
              <Input label="* Contacto 1" value={contacto1} onChange={(e: any) => setContacto1(e.target.value.replace(/\D/g, ''))} required />
              <Input label="Contacto 2" value={contacto2} onChange={(e: any) => setContacto2(e.target.value.replace(/\D/g, ''))} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-primary font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2 italic">
              <span className="material-symbols-outlined text-sm">medical_information</span> Salud
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select name="eps" label="* EPS" options={EPS_COLOMBIA} required />
              <Select name="rh_g" label="* Grupo Sanguíneo" options={GRUPOS_RH} required />
              <Select name="rh_f" label="* Factor" options={FACTORES_RH} required />
            </div>
            <textarea name="medicos" placeholder="Alergias o condiciones médicas..." className="w-full bg-slate-900 border border-white/5 rounded-[2rem] p-6 text-xs text-white outline-none focus:ring-1 focus:ring-primary h-24" />
          </section>

          <button type="submit" disabled={loading} className="w-full bg-primary text-black font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-[11px] hover:shadow-[0_0_30px_rgba(19,236,236,0.4)] transition-all">
            {loading ? 'Procesando Registro...' : 'Finalizar Registro de Alumno'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Componentes Auxiliares (Input y Select)
const Input = ({ label, name, type = "text", placeholder, value, onChange, required }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">{label}</label>
    <input name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} className="bg-slate-900 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:ring-1 focus:ring-primary outline-none text-[11px] w-full transition-all" />
  </div>
);

const Select = ({ label, name, options, value, onChange, required }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">{label}</label>
    <div className="relative">
      <select name={name} value={value} onChange={onChange} required={required} className="bg-slate-900 border border-white/5 rounded-xl py-3.5 px-4 text-[11px] text-white outline-none w-full appearance-none focus:ring-1 focus:ring-primary transition-all">
        <option value="">Seleccionar...</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm">expand_more</span>
    </div>
  </div>
);

export default FormularioRegistroAlumno;
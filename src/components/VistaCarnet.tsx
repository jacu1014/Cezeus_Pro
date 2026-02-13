import React, { useState } from 'react';

const VistaCarnet = ({ alumno }: { alumno: any }) => {
  const [esReverso, setEsReverso] = useState(false);

  if (!alumno) {
    return (
      <div className="w-[340px] h-[520px] bg-[#0a0f18]/40 border-2 border-dashed border-white/5 rounded-[3rem] flex items-center justify-center text-slate-600 italic text-xs tracking-[0.2em]">
        ESPERANDO SELECCIÓN...
      </div>
    );
  }

  // Combinación de nombres para el frente
  const nombreCompleto = `${alumno.primer_nombre} ${alumno.segundo_nombre || ''}`.trim();
  const apellidosCompletos = `${alumno.primer_apellido} ${alumno.segundo_apellido || ''}`.trim();
  const nombreAcudiente = `${alumno.acudiente_primer_nombre || ''} ${alumno.acudiente_primer_apellido || ''}`.trim();

  return (
    <div className="flex flex-col items-center gap-6">
      <div 
        className="w-[340px] h-[520px] cursor-pointer [perspective:1200px]"
        onClick={() => setEsReverso(!esReverso)}
      >
        <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${esReverso ? '[transform:rotateY(180deg)]' : ''}`}>
          
          {/* --- CARA FRONTAL --- */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-[#0d121f] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="pt-8">
              <h1 className="text-white text-center font-black uppercase tracking-[0.3em] text-[12px]">
                Club Deportivo <span className="text-primary">CEZEUS</span>
              </h1>
            </div>

            <div className="px-8 pt-6 flex-1 flex flex-col items-center">
              {/* Foto de Perfil */}
              <div className={`relative p-[4px] rounded-2xl bg-gradient-to-b ${alumno.estado === 'ACTIVO' ? 'from-emerald-400 to-transparent' : 'from-rose-500 to-transparent'}`}>
                <div className="w-32 h-40 bg-slate-950 rounded-xl overflow-hidden">
                  {alumno.foto_url ? (
                    <img src={alumno.foto_url} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <span className="material-symbols-outlined text-5xl text-slate-700">person</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nombres y Apellidos Directos */}
              <div className="text-center mt-6 w-full space-y-1">
                <p className="text-white font-black text-2xl uppercase tracking-tighter leading-none">
                  {apellidosCompletos}
                </p>
                <p className="text-primary font-bold text-xl uppercase tracking-tight">
                  {nombreCompleto}
                </p>
              </div>

              {/* Categoría Resaltada */}
              <div className="mt-6 w-full">
                <div className="bg-primary/10 border border-primary/20 py-3 rounded-2xl text-center shadow-lg shadow-primary/5">
                  <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1 opacity-70">Categoría</p>
                  <p className="text-white font-black text-lg uppercase tracking-tight italic">
                    {alumno.categoria || 'POR ASIGNAR'}
                  </p>
                </div>
              </div>

              {/* Datos Médicos Rápidos */}
              <div className="w-full grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <span className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">RH</span>
                  <span className="text-white font-black text-base uppercase">{alumno.rh_grupo}{alumno.rh_factor}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <span className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">EPS</span>
                  <span className="text-white font-black text-[10px] uppercase truncate block">{alumno.eps || '---'}</span>
                </div>
              </div>
            </div>

            {/* Barra de Estado */}
            <div className={`py-4 px-6 flex justify-center items-center ${alumno.estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              <span className="text-black font-black text-[10px] uppercase tracking-[0.5em]">
                {alumno.estado}
              </span>
            </div>
          </div>

          {/* --- CARA TRASERA --- */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#0d121f] border border-white/10 rounded-[2.5rem] flex flex-col shadow-2xl">
            <div className="pt-8">
              <h1 className="text-white text-center font-black uppercase tracking-[0.3em] text-[12px] opacity-30">
                Club Deportivo CEZEUS
              </h1>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-center gap-6">
              {/* Acudiente */}
              <div className="bg-white/[0.03] p-5 rounded-[2rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <span className="material-symbols-outlined text-4xl">family_history</span>
                </div>
                <p className="text-[8px] text-primary font-black uppercase tracking-[0.2em] mb-2">Acudiente / {alumno.acudiente_parentesco}</p>
                <p className="text-white font-black text-lg uppercase leading-tight">{nombreAcudiente || 'NO REGISTRADO'}</p>
                
                <div className="mt-4 flex gap-4">
                  <div className="flex-1">
                    <p className="text-[7px] text-slate-500 font-black uppercase mb-1">Teléfono 1</p>
                    <p className="text-white font-black text-sm tracking-widest">{alumno.contacto_1 || '---'}</p>
                  </div>
                  {alumno.contacto_2 && (
                    <div className="flex-1 border-l border-white/10 pl-4">
                      <p className="text-[7px] text-slate-500 font-black uppercase mb-1">Teléfono 2</p>
                      <p className="text-white font-black text-sm tracking-widest">{alumno.contacto_2}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Condiciones Médicas */}
              <div className="bg-rose-500/5 p-5 rounded-[2rem] border border-rose-500/10 min-h-[100px]">
                <div className="flex items-center gap-2 mb-2 text-rose-500">
                  <span className="material-symbols-outlined text-sm">medical_information</span>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em]">Condiciones Médicas</p>
                </div>
                <p className="text-slate-300 text-[10px] leading-relaxed italic">
                  {alumno.condiciones_medicas || 'Sin observaciones médicas relevantes registradas.'}
                </p>
              </div>
            </div>

            {/* Mensaje Final */}
            <div className="p-8 text-center border-t border-white/5 bg-white/[0.02]">
              <p className="text-[8px] text-slate-400 uppercase font-black tracking-[0.2em] leading-relaxed">
                Este documento es personal e intransferible.<br/>En caso de pérdida contactar al club.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botón de Acción */}
      <button 
        onClick={() => setEsReverso(!esReverso)}
        className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 text-slate-400 py-3 px-10 rounded-full border border-white/10 transition-all shadow-xl"
      >
        <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform duration-700">flip</span>
        <span className="font-black text-[10px] uppercase tracking-[0.3em]">Girar Tarjeta</span>
      </button>
    </div>
  );
};

export default VistaCarnet;
import React from 'react';

const VistaCarnet: React.FC<{ alumno?: any }> = ({ alumno }) => {
  if (!alumno) return <div className="text-center py-20 text-slate-500 uppercase text-[10px] tracking-widest italic font-black">Selecciona un alumno para ver su carnet</div>;

  const esInactivo = alumno.estado === 'INACTIVO';

  return (
    <div className={`flex flex-col items-center justify-center py-10 px-4 animate-in zoom-in-95 duration-300 ${esInactivo ? 'grayscale opacity-80' : ''}`}>
      <div className="mb-10 text-center space-y-2">
        <h2 className="text-xl font-black text-white uppercase italic">Carnet Oficial de <span className="text-primary">Competición</span></h2>
        <p className="text-[10px] text-slate-500 font-bold tracking-widest">ESTADO: {alumno.estado || 'ACTIVO'}</p>
      </div>
      <div className="relative w-full max-w-[380px] aspect-[1.6/1] bg-[#0f172a] rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(19,236,236,0.15)] border border-white/10 group">
        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
          <span className="material-symbols-outlined text-6xl text-white">sports_soccer</span>
        </div>
        <div className={`absolute bottom-0 left-0 w-full h-1.5 ${esInactivo ? 'bg-rose-500' : 'bg-primary'}`}></div>
        <div className="relative z-10 p-8 flex gap-8">
          <div className="w-32 h-36 rounded-2xl bg-slate-800 border-2 border-primary/20 overflow-hidden shadow-xl">
             <img src={alumno.foto_url || "https://picsum.photos/seed/default/200/200"} className="w-full h-full object-cover" alt="Avatar" />
          </div>
          <div className="flex-1 flex flex-col justify-between py-1">
             <div>
                <h4 className="text-[9px] font-black text-primary uppercase mb-1 tracking-widest opacity-70">Alumno</h4>
                <p className="text-sm font-black text-white uppercase italic leading-tight">{alumno.primer_nombre} {alumno.primer_apellido}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{alumno.categoria}</p>
             </div>
             <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Grupo RH</p>
                   <p className="text-[10px] font-black text-primary italic">{alumno.rh_grupo}{alumno.rh_factor}</p>
                </div>
                <p className="text-[10px] font-black text-white uppercase italic bg-white/5 px-3 py-1 rounded-lg border border-white/5 tracking-widest">GOLD CLUB</p>
             </div>
          </div>
        </div>
      </div>
      <button className="mt-10 flex items-center gap-3 bg-white/5 px-8 py-3 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all active:scale-95">
        <span className="material-symbols-outlined">download</span> Descargar PDF
      </button>
    </div>
  );
};

export default VistaCarnet;
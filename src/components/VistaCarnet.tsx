import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const VistaCarnet = ({ alumno }: { alumno: any }) => {
  const [esReverso, setEsReverso] = useState(false);
  const [descargando, setDescargando] = useState(false);
  
  const caraFrontalRef = useRef<HTMLDivElement>(null);
  const caraTraseraRef = useRef<HTMLDivElement>(null);

  if (!alumno) return null;

  const nombreCompleto = `${alumno.primer_nombre} ${alumno.segundo_nombre || ''}`.trim();
  const apellidosCompletos = `${alumno.primer_apellido} ${alumno.segundo_apellido || ''}`.trim();
  const nombreAcudiente = `${alumno.acudiente_primer_nombre || ''} ${alumno.acudiente_primer_apellido || ''}`.trim();

  const descargarPDF = async () => {
    // Verificamos que existan las referencias
    if (!caraFrontalRef.current || !caraTraseraRef.current) return;
    
    setDescargando(true);
    
    try {
      // Definimos el tamaño del PDF (65mm x 92mm) para que coincida con el carnet alargado
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [65, 92] });
      
      const opcionesCaptura = {
        scale: 4, // Alta calidad
        useCORS: true,
        backgroundColor: '#0d121f',
        // ESTA FUNCIÓN ELIMINA EL EFECTO ESPEJO
        onclone: (clonedDoc: Document) => {
          const frontal = clonedDoc.getElementById('captura-frontal');
          const trasera = clonedDoc.getElementById('captura-trasera');
          
          if (frontal) {
            frontal.style.transform = 'none';
            frontal.style.webkitTransform = 'none';
            frontal.style.position = 'relative';
            frontal.style.display = 'flex';
          }
          if (trasera) {
            trasera.style.transform = 'none';
            trasera.style.webkitTransform = 'none';
            trasera.style.position = 'relative';
            trasera.style.display = 'flex';
          }
        }
      };

      // Capturamos cara frontal
      const canvasFront = await html2canvas(caraFrontalRef.current, opcionesCaptura);
      pdf.addImage(canvasFront.toDataURL('image/png', 1.0), 'PNG', 0, 0, 65, 92);

      // Nueva página y capturamos cara trasera
      pdf.addPage([65, 92], 'portrait');
      const canvasBack = await html2canvas(caraTraseraRef.current, opcionesCaptura);
      pdf.addImage(canvasBack.toDataURL('image/png', 1.0), 'PNG', 0, 0, 65, 92);

      pdf.save(`Carnet_${alumno.numero_documento}.pdf`);
    } catch (error) {
      console.error("Error en PDF:", error);
    } finally {
      setDescargando(false);
    }
  };

  const colorEstado = alumno.estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Visualización del Carnet (con efecto de giro para el usuario) */}
      <div className="w-[400px] h-[560px] cursor-pointer [perspective:2000px]">
        <div 
          onClick={() => setEsReverso(!esReverso)}
          className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${esReverso ? '[transform:rotateY(180deg)]' : ''}`}
        >
          
          {/* --- CARA FRONTAL --- */}
          <div 
            id="captura-frontal"
            ref={caraFrontalRef} 
            className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-[#0d121f] border border-white/10 rounded-[2.8rem] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="pt-10 text-center">
              <h1 className="text-white font-black uppercase tracking-[0.3em] text-[14px]">
                Club Deportivo <span className="text-primary">CEZEUS</span>
              </h1>
            </div>

            <div className="px-10 pt-6 flex-1 flex flex-col items-center">
              {/* Marco de Foto */}
              <div className={`p-1 rounded-2xl bg-gradient-to-b ${alumno.estado === 'ACTIVO' ? 'from-emerald-400' : 'from-rose-500'} to-transparent`}>
                <div className="w-36 h-46 bg-slate-950 rounded-xl overflow-hidden shadow-inner">
                  <img src={alumno.foto_url} alt="Foto" className="w-full h-full object-cover" crossOrigin="anonymous" />
                </div>
              </div>

              {/* Datos Nombre */}
              <div className="text-center mt-8 w-full">
                <p className="text-white font-black text-2xl uppercase tracking-tighter leading-tight mb-1">{apellidosCompletos}</p>
                <p className="text-primary font-bold text-xl uppercase tracking-tight leading-none">{nombreCompleto}</p>
              </div>

              {/* Categoría */}
              <div className="mt-6 w-full bg-primary/10 border border-primary/20 py-3 rounded-2xl text-center">
                <p className="text-white font-black text-[15px] uppercase italic tracking-wider">{alumno.categoria}</p>
              </div>

              {/* Datos Médicos/EPS */}
              <div className="w-full grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 shadow-inner">
                  <span className="block text-[9px] text-slate-500 font-black uppercase mb-1">RH</span>
                  <span className="text-white text-lg font-black">{alumno.rh_grupo}{alumno.rh_factor}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 overflow-hidden shadow-inner">
                  <span className="block text-[9px] text-slate-500 font-black uppercase mb-1">EPS</span>
                  <span className="text-white text-[11px] font-black uppercase truncate block">{alumno.eps}</span>
                </div>
              </div>
            </div>

            {/* BARRA INFERIOR (SIN TEXTO) */}
            <div className={`h-12 w-full ${colorEstado} flex items-center justify-center relative`}>
                <div className="w-12 h-1 bg-black/20 rounded-full"></div>
                <div className="absolute top-0 w-full h-[1px] bg-white/10"></div>
            </div>
          </div>

          {/* --- CARA TRASERA --- */}
          <div 
            id="captura-trasera"
            ref={caraTraseraRef} 
            className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#0d121f] border border-white/10 rounded-[2.8rem] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="pt-10 text-center opacity-30">
              <h1 className="text-white font-black uppercase tracking-[0.3em] text-[12px]">Club Deportivo CEZEUS</h1>
            </div>

            <div className="p-10 flex-1 flex flex-col justify-center gap-6">
              {/* Información del Responsable */}
              <div className="bg-white/[0.03] p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
                <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mb-2">Responsable / {alumno.acudiente_parentesco}</p>
                <p className="text-white font-black text-xl uppercase mb-5 leading-tight">{nombreAcudiente}</p>
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    <div>
                        <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Contacto 1</p>
                        <p className="text-white font-black text-sm">{alumno.contacto_1}</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Contacto 2</p>
                        <p className="text-white font-black text-sm">{alumno.contacto_2}</p>
                    </div>
                </div>
              </div>

              {/* Condiciones Médicas */}
              <div className="bg-rose-500/5 p-6 rounded-[2.5rem] border border-rose-500/10 min-h-[120px]">
                <p className="text-[9px] text-rose-500 font-black uppercase tracking-[0.2em] mb-2 italic">Condiciones Médicas</p>
                <p className="text-slate-300 text-[11px] leading-relaxed italic line-clamp-4">
                  {alumno.condiciones_medicas || 'Sin observaciones registradas.'}
                </p>
              </div>
            </div>

            {/* Pie de Página */}
            <div className="pb-4 pt-2 text-center">
              <p className="text-[10px] text-primary font-black tracking-[0.15em] mb-1">313 418 5403 — 313 354 0606</p>
              <p className="text-[8px] text-slate-500 uppercase font-bold tracking-[0.1em]">CEZEUS • OFICIAL</p>
            </div>

            {/* BARRA INFERIOR (SIN TEXTO) */}
            <div className={`h-12 w-full ${colorEstado} flex items-center justify-center relative`}>
                <div className="w-12 h-1 bg-black/20 rounded-full"></div>
                <div className="absolute top-0 w-full h-[1px] bg-white/10"></div>
            </div>
          </div>

        </div>
      </div>
      
      {/* CONTROLES */}
      <div className="flex gap-3 w-full max-w-[400px]">
        <button 
          onClick={() => setEsReverso(!esReverso)} 
          className="flex-1 bg-white/5 text-slate-400 py-4 rounded-full border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Girar Carnet
        </button>
        <button 
          onClick={descargarPDF} 
          disabled={descargando}
          className="flex-[2] flex items-center justify-center gap-2 bg-primary text-black py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 active:scale-95 transition-all"
        >
          {descargando ? 'GENERANDO...' : 'DESCARGAR CARNET'}
        </button>
      </div>
    </div>
  );
};

export default VistaCarnet;
import React from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  ResponsiveContainer, 
  PolarRadiusAxis 
} from 'recharts';

// Datos de ejemplo: Comparativa entre el inicio (B) y el estado actual (A)
const radarData = [
  { subject: 'Velocidad', A: 90, B: 70 },
  { subject: 'Regate', A: 85, B: 65 },
  { subject: 'Pase', A: 75, B: 80 },
  { subject: 'Resistencia', A: 95, B: 75 },
  { subject: 'Fuerza', A: 80, B: 85 },
  { subject: 'Técnica', A: 88, B: 60 },
];

const SeguimientoAlumno: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-4">
        
        {/* PANEL IZQUIERDO: PERFIL Y DATOS CRÍTICOS */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-[#0a0f18]/60 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="h-24 bg-gradient-to-r from-primary/20 to-transparent"></div>
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-6">
                <img 
                  src="https://picsum.photos/seed/mateo/200/200" 
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-[#0a0f18] shadow-2xl"
                  alt="Foto Alumno" 
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-black text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                  #9
                </div>
              </div>

              <h2 className="text-2xl font-black text-white uppercase italic leading-none mb-1">Mateo Rodríguez</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-6">Delantero Centro • Diestro</p>

              <div className="grid grid-cols-2 gap-3">
                <MiniCard label="Edad" val="14 Años" icon="calendar_today" />
                <MiniCard label="Categoría" val="Sub-15 A" icon="military_tech" />
                <MiniCard label="EPS" val="Sura" icon="health_and_safety" />
                <MiniCard label="RH" val="O+" icon="bloodtype" />
              </div>

              {/* SECCIÓN DE EMERGENCIA RESALTADA */}
              <div className="mt-8 p-5 bg-red-500/5 border border-red-500/10 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <span className="material-symbols-outlined text-4xl text-red-500">emergency</span>
                </div>
                <h3 className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  Responsable & Emergencias
                </h3>
                <p className="text-[11px] font-bold text-white uppercase">Claudia Pérez (Madre)</p>
                <p className="text-lg font-black text-primary tracking-tighter">315 789 4561</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Alergias: Ninguna</p>
              </div>
            </div>
          </div>

          {/* BARRA DE ESTADO FÍSICO */}
          <div className="bg-[#0a0f18]/60 border border-white/5 p-6 rounded-[2rem]">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Estado de Forma</h3>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary shadow-[0_0_10px_#13ecec]" style={{ width: '92%' }}></div>
              </div>
              <span className="text-xs font-black text-primary">92%</span>
            </div>
            <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">
              Apto para competencia. Se recomienda hidratación extra por carga física.
            </p>
          </div>
        </div>

        {/* PANEL DERECHO: ANALÍTICA Y NOTAS */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* GRÁFICO DE RENDIMIENTO TÉCNICO */}
          <div className="bg-[#0a0f18]/60 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-lg font-black text-white uppercase italic leading-none">Rendimiento Progresivo</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Evaluación Técnica Trimestral</p>
              </div>
              <div className="flex gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                 <Legend color="bg-slate-700" label="Inicial" />
                 <Legend color="bg-primary shadow-[0_0_8px_#13ecec]" label="Actual" />
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Inicial" dataKey="B" stroke="#334155" fill="#334155" fillOpacity={0.3} />
                  <Radar name="Actual" dataKey="A" stroke="#13ecec" fill="#13ecec" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/5">
               <BigMetric val="12" label="Goles Totales" />
               <BigMetric val="08" label="Asistencias" />
               <BigMetric val="95%" label="Asistencia" />
               <BigMetric val="8.8" label="Puntaje Prom." />
            </div>
          </div>

          {/* BITÁCORA DE SEGUIMIENTO */}
          <div className="bg-[#0a0f18]/60 border border-white/5 rounded-[2.5rem] overflow-hidden">
             <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <span className="font-black text-[10px] text-slate-500 uppercase tracking-widest">Observaciones del Staff</span>
                <button className="bg-primary text-black text-[9px] font-black px-3 py-1 rounded-lg uppercase hover:scale-105 transition-transform">
                    Añadir Nota
                </button>
             </div>
             <div className="divide-y divide-white/[0.03]">
                <ObservationRow 
                  date="12 Feb, 2024" 
                  text="Manejo excepcional de tiempos. Debe reforzar el remate de media distancia con pierna izquierda." 
                  staff="Prof. Arley"
                />
                <ObservationRow 
                  date="05 Feb, 2024" 
                  text="Completó sesión de recuperación. Sin signos de dolor en rodilla tras el último partido." 
                  staff="Fisioterapeuta"
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES ATÓMICOS ---

const MiniCard = ({ label, val, icon }: any) => (
  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-2 mb-1">
      <span className="material-symbols-outlined text-[14px] text-slate-500">{icon}</span>
      <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
    </div>
    <p className="text-[11px] font-black text-white uppercase">{val}</p>
  </div>
);

const BigMetric = ({ val, label }: any) => (
  <div className="text-center group">
    <p className="text-2xl font-black text-white group-hover:text-primary transition-colors">{val}</p>
    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
  </div>
);

const Legend = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

const ObservationRow = ({ date, text, staff }: any) => (
  <div className="px-8 py-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-white/[0.02] transition-colors">
    <div className="min-w-[100px]">
        <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded-md">{date}</span>
    </div>
    <p className="text-[11px] text-slate-300 italic flex-1 leading-relaxed">"{text}"</p>
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">{staff}</span>
  </div>
);

export default SeguimientoAlumno;
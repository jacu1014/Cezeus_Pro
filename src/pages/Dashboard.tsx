import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Activity, Student, MetricCardProps } from '../types';

const Dashboard: React.FC = () => {
  // --- ESTADOS ---
  const [metrics, setMetrics] = useState({
    pagosPendientes: 0,
    ingresosMes: 0,
    asistenciaPromedio: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Métricas: Pagos Pendientes
      const { count: pendientes } = await supabase
        .from('pagos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

      // 2. Métricas: Ingresos del Mes
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: pagosRealizados } = await supabase
        .from('pagos')
        .select('monto')
        .eq('estado', 'completado')
        .gte('fecha_pago', inicioMes);

      const totalIngresos = pagosRealizados?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;

      // 3. Métricas: Asistencia Promedio
      const { data: asistencias } = await supabase.from('asistencias').select('presente');
      const promedio = asistencias && asistencias.length > 0 
        ? (asistencias.filter(a => a.presente).length / asistencias.length) * 100 
        : 0;

      setMetrics({
        pagosPendientes: pendientes || 0,
        ingresosMes: totalIngresos,
        asistenciaPromedio: Math.round(promedio),
      });

      // 4. CARGA DE ACTIVIDAD REAL (Tabla 'actividad')
      const { data: logs, error: logsError } = await supabase
        .from('actividad')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(6);

      if (!logsError && logs) {
        const mappedActivities: Activity[] = logs.map(log => ({
          id: log.id,
          // Mapeo dinámico de iconos basado en el tipo de acción
          type: log.accion.includes('PAGO') ? 'payment' : 
                log.accion.includes('ALUMNO') || log.accion.includes('STAFF') ? 'enrollment' : 'report',
          title: log.usuario_nombre,
          subtitle: log.descripcion,
          time: formatRelativeTime(new Date(log.fecha))
        }));
        setActivities(mappedActivities);
      }

    } catch (error) {
      console.error("Error al cargar datos del Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper para mostrar "Hace 5 min", "Hace 2 horas", etc.
  const formatRelativeTime = (date: Date) => {
    const diffInMs = new Date().getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);

    if (diffInMins < 1) return 'Ahora';
    if (diffInMins < 60) return `${diffInMins}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  const chartData = [
    { name: 'ENE', val: 12 }, { name: 'FEB', val: 18 }, { name: 'MAR', val: 15 },
    { name: 'ABR', val: 24 }, { name: 'MAY', val: 22 }, { name: 'JUN', val: 32 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
          Dashboard <span className="text-primary">Cezeus</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
          Gestión Administrativa y Deportiva
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard 
          title="PAGOS PENDIENTES" 
          value={loading ? "..." : metrics.pagosPendientes.toString()} 
          label="Alumnos" 
          icon="pending_actions" 
          color="red" 
        />
        <MetricCard 
          title="INGRESOS MES" 
          value={loading ? "..." : `$${metrics.ingresosMes.toLocaleString()}`} 
          label="USD" 
          icon="monetization_on" 
          color="primary" 
        />
        <MetricCard 
          title="ASISTENCIA" 
          value={loading ? "..." : `${metrics.asistenciaPromedio}%`} 
          label="Promedio" 
          icon="event_available" 
          color="teal" 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfica */}
        <div className="lg:col-span-2 bg-cezeus-card/30 backdrop-blur-sm p-6 rounded-[2rem] border border-white/5 shadow-xl">
          <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-8">Crecimiento Académico</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(19, 236, 236, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                />
                <Bar dataKey="val" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#13ecec' : '#1e293b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actividad RECIENTE REAL */}
        <div className="bg-cezeus-card/30 backdrop-blur-sm p-6 rounded-[2rem] border border-white/5 shadow-xl">
          <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-8">Historial Reciente</h3>
          <div className="space-y-6">
            {activities.length > 0 ? activities.map((act) => (
              <ActivityItem key={act.id} activity={act} />
            )) : (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-slate-700 text-4xl mb-2">history</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sin actividad registrada</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const MetricCard: React.FC<MetricCardProps> = ({ title, value, label, icon, color }) => {
  const colorStyles = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    teal: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  };

  return (
    <div className="bg-cezeus-card/40 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-white/10 transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${colorStyles[color]}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-white">{value}</h3>
        <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const iconConfig = {
    payment: { icon: 'payments', color: 'text-teal-400 bg-teal-500/10' },
    enrollment: { icon: 'person_add', color: 'text-blue-400 bg-blue-500/10' },
    report: { icon: 'history_edu', color: 'text-slate-400 bg-white/5' },
  };

  const { icon, color } = iconConfig[activity.type] || iconConfig.report;

  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[11px] font-bold text-white truncate uppercase">{activity.title}</h4>
        <p className="text-[10px] text-slate-500 font-medium truncate leading-tight">{activity.subtitle}</p>
      </div>
      <span className="text-[9px] font-black text-slate-600 uppercase whitespace-nowrap">{activity.time}</span>
    </div>
  );
};

export default Dashboard;
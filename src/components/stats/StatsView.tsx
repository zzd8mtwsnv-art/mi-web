import React from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { formatMinutes } from '../../utils/dateUtils';
import {
  Flame,
  Clock,
  Award,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';

export const StatsView: React.FC = () => {
  const {
    sessions,
    subjects,
    currentStreak,
    streakRecord,
    todayStudyMinutes,
    weeklyStudyMinutes
  } = useApp();

  // Total study minutes all time
  const totalStudyMinutes = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // This month study minutes
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const monthStudyMinutes = sessions
    .filter((s) => s.date.startsWith(currentMonthPrefix))
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // Daily Average (over 7 days)
  const dailyAverageMinutes = Math.round(weeklyStudyMinutes / 7);

  // Study time by subject
  const subjectStudyData = subjects.map((sub) => {
    const mins = sessions
      .filter((s) => s.subjectId === sub.id)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    return {
      name: sub.name,
      shortName: sub.shortName || sub.name.substring(0, 8),
      minutos: mins,
      horas: Number((mins / 60).toFixed(1)),
      color: sub.color
    };
  }).filter((s) => s.minutos > 0);

  // Most studied subject
  const mostStudied = [...subjectStudyData].sort((a, b) => b.minutos - a.minutos)[0];

  // Daily activity for last 14 days
  const daily14Days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split('T')[0];
    const mins = sessions
      .filter((s) => s.date.startsWith(dateStr))
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    return {
      fecha: dateStr.substring(5),
      minutos: mins,
      horas: Number((mins / 60).toFixed(1))
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Estadísticas & Métricas de Rendimiento
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Análisis profundo de horas de estudio, rachas y reparto por materia
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard padding="md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hoy</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatMinutes(todayStudyMinutes)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Media diaria: {formatMinutes(dailyAverageMinutes)}</span>
        </GlassCard>

        <GlassCard padding="md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Esta Semana</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatMinutes(weeklyStudyMinutes)}
          </div>
          <span className="text-xs text-emerald-500 font-semibold mt-1 block">Últimos 7 días activos</span>
        </GlassCard>

        <GlassCard padding="md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Este Mes</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatMinutes(monthStudyMinutes)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Total histórico: {formatMinutes(totalStudyMinutes)}</span>
        </GlassCard>

        <GlassCard padding="md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Racha Actual</span>
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500 font-mono flex items-center gap-1">
            {currentStreak} <span className="text-xs text-slate-400">días</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Mejor racha: {streakRecord} días 🔥</span>
        </GlassCard>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Study Area Chart - 7 cols */}
        <GlassCard padding="lg" className="lg:col-span-7 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Evolución Diaria (Últimos 14 días)
            </h3>
            <span className="text-xs text-slate-400">Horas de dedicación</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily14Days} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="studyColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} unit="h" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 text-white text-xs backdrop-blur-md border border-white/10 shadow-xl">
                          <p className="font-bold">Fecha: {data.fecha}</p>
                          <p className="text-indigo-300 font-mono mt-0.5">{data.horas} horas ({data.minutos} min)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="horas" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#studyColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Study Time By Subject Pie Chart - 5 cols */}
        <GlassCard padding="lg" className="lg:col-span-5 space-y-3 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Reparto por Asignatura
            </h3>
            <span className="text-xs text-slate-400">Total acumulado</span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectStudyData}
                  dataKey="minutos"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {subjectStudyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2 rounded-xl bg-slate-900/90 text-white text-xs backdrop-blur-md border border-white/10 shadow-xl">
                          <p className="font-bold">{d.name}</p>
                          <p className="text-indigo-300 font-mono">{formatMinutes(d.minutos)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top subject badge */}
          {mostStudied && (
            <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-500/20 flex items-center justify-between text-xs">
              <span className="text-slate-500">Materia más estudiada:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{mostStudied.name} ({formatMinutes(mostStudied.minutos)})</span>
            </div>
          )}
        </GlassCard>
      </div>

      {/* 30-Day Activity Heatmap */}
      <GlassCard padding="lg" className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Registro de Constancia (Últimos 30 días)
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2 pt-2">
          {Array.from({ length: 30 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            const dateStr = d.toISOString().split('T')[0];
            const hasStudy = sessions.some((s) => s.date.startsWith(dateStr));

            return (
              <div
                key={dateStr}
                title={`${dateStr}: ${hasStudy ? 'Estudiado' : 'Sin registro'}`}
                className={`h-7 rounded-xl flex items-center justify-center text-[10px] font-mono font-bold transition-transform hover:scale-110 cursor-pointer ${
                  hasStudy
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};

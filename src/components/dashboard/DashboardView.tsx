import React from 'react';
import {
  Flame,
  Clock,
  CheckSquare,
  FileText,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
  BookOpen,
  Plus,
  Mic,
  Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { formatHeaderDate, formatMinutes, getRelativeDayString, getDayOfWeekIndex } from '../../utils/dateUtils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    settings,
    subjects,
    tasks,
    exams,
    schedule,
    sessions,
    customEvents,
    goals,
    currentStreak,
    todayStudyMinutes,
    globalAverageGrade,
    pendingTasksCount,
    urgentTasksCount,
    setActiveView,
    setIsQuickAddOpen,
    toggleTaskComplete
  } = useApp();

  // Dynamic greeting based on current hour
  const currentHour = new Date().getHours();
  let greetingText = 'Buenos días';
  if (currentHour >= 13 && currentHour < 20) {
    greetingText = 'Buenas tardes';
  } else if (currentHour >= 20 || currentHour < 6) {
    greetingText = 'Buenas noches';
  }

  // Next Upcoming Exam
  const upcomingExams = [...exams]
    .filter((e) => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextExam = upcomingExams[0];
  const nextExamSubject = nextExam ? subjects.find((s) => s.id === nextExam.subjectId) : null;

  // Today's classes from timetable
  const dayOfWeek = getDayOfWeekIndex(new Date()) as 1 | 2 | 3 | 4 | 5;
  const todayClasses = schedule
    .filter((s) => s.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Today's tasks (due today or overdue)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks
    .filter((t) => t.dueDate <= todayDateStr || t.status === 'en_progreso')
    .slice(0, 5);

  // Today's custom events (Evento, Exposición, Recordatorio)
  const todayCustomEvents = customEvents.filter((ev) => ev.date === todayDateStr);

  // Weekly study data for the Recharts Bar Chart (last 7 days)
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayMins = sessions
      .filter((s) => s.date.startsWith(dateStr))
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    return {
      day: dayLabels[d.getDay()],
      fullDate: dateStr,
      horas: Number((dayMins / 60).toFixed(1)),
      minutos: dayMins,
      isToday: dateStr === todayDateStr
    };
  });

  // Daily study progress percentage
  const dailyGoalMins = settings.dailyStudyGoalMinutes || 120;
  const dailyProgressPercent = Math.min(100, Math.round((todayStudyMinutes / dailyGoalMins) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 glass-panel border border-white/60 dark:border-white/10 shadow-xl shadow-indigo-950/5">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500/20 via-pink-500/15 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {formatHeaderDate()}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser?.gradeLevel || settings.gradeLevel}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {greetingText}, {currentUser?.name || settings.studentName || 'Estudiante'} 👋
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Tienes <span className="font-semibold text-indigo-600 dark:text-indigo-400">{pendingTasksCount} tareas</span> pendientes y{' '}
              <span className="font-semibold text-rose-500">{upcomingExams.length} exámenes</span> en el horizonte. ¡A por un día productivo!
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <GlassButton
              variant="primary"
              onClick={() => setActiveView('focus')}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Iniciar Sesión Focus
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Quick Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Próximo Examen */}
        <GlassCard
          interactive
          padding="sm"
          onClick={() => setActiveView('exams')}
          className="flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Próx. Examen</span>
            <FileText className="w-4 h-4 text-rose-500" />
          </div>
          {nextExam ? (
            <div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                {getRelativeDayString(nextExam.date)}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {nextExamSubject?.name || nextExam.title}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Sin exámenes próximos</div>
          )}
        </GlassCard>

        {/* Tareas Pendientes */}
        <GlassCard
          interactive
          padding="sm"
          onClick={() => setActiveView('tasks')}
          className="flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tareas</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {pendingTasksCount}
            </div>
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-0.5">
              {urgentTasksCount > 0 ? `${urgentTasksCount} urgentes` : 'Al día'}
            </div>
          </div>
        </GlassCard>

        {/* Tiempo Hoy */}
        <GlassCard
          interactive
          padding="sm"
          onClick={() => setActiveView('focus')}
          className="flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Estudio Hoy</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatMinutes(todayStudyMinutes)}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Meta: {formatMinutes(dailyGoalMins)}
            </div>
          </div>
        </GlassCard>

        {/* Objetivo Diario */}
        <GlassCard
          interactive
          padding="sm"
          onClick={() => setActiveView('goals')}
          className="flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Meta Diaria</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {dailyProgressPercent}%
            </div>
            <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                style={{ width: `${dailyProgressPercent}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </GlassCard>

        {/* Racha de Estudio */}
        <GlassCard
          interactive
          padding="sm"
          onClick={() => setActiveView('focus')}
          className="flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Racha</span>
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-amber-500 flex items-center gap-1">
              {currentStreak} <span className="text-xs font-medium text-slate-400">días</span>
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              ¡Hábito activo! 🔥
            </div>
          </div>
        </GlassCard>

        {/* Nota Media Global */}
        <GlassCard
          interactive
          padding="sm"
          onClick={() => setActiveView('grades')}
          className="flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Nota Media</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {globalAverageGrade.toFixed(2)}
            </div>
            <div className="text-xs font-medium text-emerald-500 mt-0.5">
              Bachillerato 0-10
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Content Grid: Section "Hoy" & "Actividad Semanal" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section: Hoy (Timeline) - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Hoy en tu Agenda
              </h2>
            </div>
            <button
              onClick={() => setActiveView('schedule')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Ver Horario Completo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <GlassCard padding="md" className="space-y-4">
            {/* Eventos, Exposiciones o Recordatorios de Hoy */}
            {todayCustomEvents.length > 0 && (
              <div className="space-y-2 pb-3 border-b border-slate-200/60 dark:border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  Eventos & Avisos de Hoy ({todayCustomEvents.length})
                </span>
                <div className="space-y-2">
                  {todayCustomEvents.map((ev) => {
                    const typeColor = ev.type === 'evento' ? 'bg-purple-500/15 text-purple-600 border-purple-500/30' : ev.type === 'exposicion' ? 'bg-amber-500/15 text-amber-600 border-amber-500/30' : 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30';
                    const Icon = ev.type === 'evento' ? Calendar : ev.type === 'exposicion' ? Mic : Bell;

                    return (
                      <div
                        key={ev.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${typeColor}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 shrink-0" />
                          <div>
                            <span className="text-xs font-bold block">{ev.title}</span>
                            {ev.description && <span className="text-[11px] text-slate-500 block">{ev.description}</span>}
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white/60 dark:bg-slate-900/60 shadow-sm">
                          {ev.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clases de Hoy */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-2.5">
                Clases de Hoy ({todayClasses.length})
              </span>

              {todayClasses.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">
                  No hay clases programadas para hoy (Fin de semana o día libre).
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {todayClasses.map((item) => {
                    const sub = subjects.find((s) => s.id === item.subjectId);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            style={{ backgroundColor: sub?.color || '#6366f1' }}
                            className="w-2.5 h-8 rounded-full shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                              {sub?.name || 'Asignatura'}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {item.classroom || 'Aula estándar'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 shrink-0 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tareas de Hoy / Pendientes */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-white/10">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Tareas para Hoy & Entregas Cercanas
                </span>
                <button
                  onClick={() => setIsQuickAddOpen(true)}
                  className="text-xs text-indigo-500 font-semibold hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  ✨ No tienes tareas pendientes para hoy. ¡Todo completado!
                </p>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((t) => {
                    const sub = subjects.find((s) => s.id === t.subjectId);
                    const isDone = t.status === 'completada';

                    return (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                          isDone
                            ? 'bg-white/30 dark:bg-slate-900/30 border-slate-200/40 opacity-60'
                            : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-white/5 shadow-sm hover:border-indigo-400/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => toggleTaskComplete(t.id)}
                            className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <span
                              className={`text-xs sm:text-sm font-medium block truncate ${
                                isDone
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {t.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {sub && (
                                <span
                                  style={{ color: sub.color }}
                                  className="text-[11px] font-semibold"
                                >
                                  {sub.shortName || sub.name}
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400">
                                • {getRelativeDayString(t.dueDate)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <GlassBadge
                          size="xs"
                          color={
                            t.priority === 'urgente'
                              ? '#EF4444'
                              : t.priority === 'alta'
                              ? '#F59E0B'
                              : '#6366F1'
                          }
                        >
                          {t.priority}
                        </GlassBadge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Section: Actividad Semanal & Progreso por Asignatura - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Gráfico Actividad Semanal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Actividad Semanal
              </h2>
              <span className="text-xs text-slate-400">
                Últimos 7 días
              </span>
            </div>

            <GlassCard padding="md">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      unit="h"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded-xl bg-slate-900/90 text-white text-xs backdrop-blur-md border border-white/10 shadow-xl">
                              <p className="font-bold">{data.day} ({data.fullDate})</p>
                              <p className="text-indigo-300 mt-0.5">{data.horas} horas ({data.minutos} min)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="horas" radius={[8, 8, 4, 4]}>
                      {weeklyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isToday ? '#6366F1' : '#94A3B8'}
                          fillOpacity={entry.isToday ? 0.9 : 0.4}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/50 dark:border-white/5">
                <span>Total semana: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{formatMinutes(weeklyData.reduce((a, b) => a + b.minutos, 0))}</strong></span>
                <button
                  onClick={() => setActiveView('stats')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Ver Estadísticas
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Progreso por Asignatura */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Progreso por Asignatura
              </h2>
              <button
                onClick={() => setActiveView('subjects')}
                className="text-xs text-indigo-500 font-semibold hover:underline"
              >
                Ver Todas
              </button>
            </div>

            <GlassCard padding="md" className="space-y-3">
              {subjects.slice(0, 4).map((sub) => {
                const subAverage = sub.currentAverage || 8.0;
                const percent = Math.min(100, Math.round(subAverage * 10));

                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <div
                          style={{ backgroundColor: sub.color }}
                          className="w-2.5 h-2.5 rounded-full"
                        />
                        <span className="text-slate-800 dark:text-slate-200">
                          {sub.name}
                        </span>
                      </div>
                      <span className="text-slate-600 dark:text-slate-300 font-mono">
                        {subAverage.toFixed(1)} / 10
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/60 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${percent}%`,
                          backgroundColor: sub.color
                        }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};
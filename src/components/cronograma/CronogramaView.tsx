import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyPlan, PlannedStudySession, DayPart } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { CronogramaModal } from './CronogramaModal';
import { SessionEditModal } from './SessionEditModal';
import { formatMinutes } from '../../utils/dateUtils';
import {
  CalendarRange,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  Layers,
  ChevronRight
} from 'lucide-react';

export const CronogramaView: React.FC = () => {
  const {
    plans,
    subjects,
    addStudyPlan,
    updateStudyPlan,
    deleteStudyPlan,
    addSessionToPlan,
    updatePlanSession,
    deletePlanSession,
    setActiveView
  } = useApp();

  // State
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);

  // Session Edit State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<PlannedStudySession | null>(null);
  const [sessionTargetDate, setSessionTargetDate] = useState<string>('');

  // Selected Plan Object
  const activePlan = plans.find((p) => p.id === selectedPlanId) || null;

  // Helper: Normalize sessions for a plan (adapting legacy milestones if sessions is undefined)
  const getPlanSessions = (plan: StudyPlan): PlannedStudySession[] => {
    if (plan.sessions && Array.isArray(plan.sessions)) {
      return plan.sessions;
    }
    if (plan.milestones && Array.isArray(plan.milestones)) {
      return plan.milestones.map((m) => ({
        id: m.id,
        planId: plan.id,
        date: m.date,
        dayPart: 'tarde',
        subjectId: plan.subjectId,
        title: m.title,
        content: m.topics,
        durationMinutes: m.durationMinutes,
        completed: m.completed
      }));
    }
    return [];
  };

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: StudyPlan, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPlan(plan);
    setIsPlanModalOpen(true);
  };

  const handleDeletePlan = (planId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar este Cronograma y todas sus sesiones planificadas?')) {
      deleteStudyPlan(planId);
      if (selectedPlanId === planId) {
        setSelectedPlanId(null);
      }
    }
  };

  const handleSavePlan = (data: Omit<StudyPlan, 'id' | 'createdAt'>) => {
    if (editingPlan) {
      updateStudyPlan(editingPlan.id, data);
    } else {
      const newPlan = addStudyPlan(data);
      setSelectedPlanId(newPlan.id);
    }
  };

  // Session Management
  const handleOpenAddSession = (defaultDate?: string) => {
    setEditingSession(null);
    setSessionTargetDate(defaultDate || activePlan?.startDate || '');
    setIsSessionModalOpen(true);
  };

  const handleOpenEditSession = (session: PlannedStudySession) => {
    setEditingSession(session);
    setSessionTargetDate(session.date);
    setIsSessionModalOpen(true);
  };

  const handleSaveSession = (sessionData: Omit<PlannedStudySession, 'id' | 'planId'>) => {
    if (!activePlan) return;
    if (editingSession) {
      updatePlanSession(activePlan.id, editingSession.id, sessionData);
    } else {
      addSessionToPlan(activePlan.id, sessionData);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!activePlan) return;
    if (window.confirm('¿Deseas eliminar esta sesión planificada?')) {
      deletePlanSession(activePlan.id, sessionId);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* VISTA 1: LISTADO DE CRONOGRAMAS */}
      {!activePlan && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <CalendarRange className="w-7 h-7 text-indigo-500" /> Cronogramas de Estudio
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Tus planes guardados a corto y medio plazo con sesiones organizadas por franjas horarias
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => setActiveView('planner')}
                icon={<Sparkles className="w-4 h-4 text-indigo-500" />}
              >
                Planificador Inteligente
              </GlassButton>

              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleOpenCreatePlan}
                icon={<Plus className="w-4 h-4" />}
              >
                Nuevo Cronograma
              </GlassButton>
            </div>
          </div>

          {/* Cronogramas List */}
          {plans.length === 0 ? (
            <GlassCard padding="lg" className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
                <CalendarRange className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No tienes ningún Cronograma activo
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Crea un cronograma manual o utiliza el Planificador Inteligente para generar automáticamente un plan adaptado a tus exámenes y tareas.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <GlassButton
                  variant="primary"
                  onClick={() => setActiveView('planner')}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Generar con Planificador
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  onClick={handleOpenCreatePlan}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Crear Manualmente
                </GlassButton>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const planSessions = getPlanSessions(plan);
                const totalMinutes = planSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
                const planTypeLabel =
                  plan.type === 'examen'
                    ? 'Examen'
                    : plan.type === 'periodo_global'
                    ? 'Periodo Global'
                    : 'Manual';

                // Collect subjects involved
                const subIds = plan.subjectIds || (plan.subjectId ? [plan.subjectId] : []);
                const planSubjects = subjects.filter((s) => subIds.includes(s.id));

                const dateRangeText =
                  plan.startDate && plan.endDate
                    ? `${plan.startDate} → ${plan.endDate}`
                    : plan.examDate
                    ? `Hasta el ${plan.examDate}`
                    : 'Fechas personalizadas';

                return (
                  <GlassCard
                    key={plan.id}
                    padding="lg"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className="flex flex-col justify-between group cursor-pointer hover:border-indigo-400/60 transition-all shadow-md"
                  >
                    <div>
                      {/* Top Row: Type Badge + Actions */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                          {planTypeLabel}
                        </span>

                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditPlan(plan, e)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                            title="Editar cronograma"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeletePlan(plan.id, e)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                            title="Eliminar cronograma"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Dates */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {plan.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateRangeText}</span>
                      </div>

                      {/* Subject pills */}
                      {planSubjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {planSubjects.map((s) => (
                            <span
                              key={s.id}
                              style={{ backgroundColor: `${s.color}20`, color: s.color, borderColor: `${s.color}40` }}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Stats & Open CTA */}
                    <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-200/50 dark:border-white/5">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{planSessions.length}</strong> sesiones ({formatMinutes(totalMinutes)})
                      </div>

                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-0.5">
                        Ver plan <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: DETALLE DEL CRONOGRAMA ACTIVO */}
      {activePlan && (() => {
        const planSessions = getPlanSessions(activePlan);
        const totalMinutes = planSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

        // Group sessions by date
        const sessionsByDate: Record<string, PlannedStudySession[]> = {};
        planSessions.forEach((s) => {
          if (!sessionsByDate[s.date]) sessionsByDate[s.date] = [];
          sessionsByDate[s.date].push(s);
        });

        const sortedDates = Object.keys(sessionsByDate).sort();

        return (
          <div className="space-y-6">
            {/* Header / Nav Back Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPlanId(null)}
                  className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-1.5 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {activePlan.title}
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>📅 {activePlan.startDate || 'Inicio'} → {activePlan.endDate || activePlan.examDate || 'Fin'}</span>
                    <span>•</span>
                    <span>📚 {planSessions.length} sesiones ({formatMinutes(totalMinutes)})</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenEditPlan(activePlan)}
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Editar Plan
                </GlassButton>

                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenAddSession()}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  + Añadir Sesión
                </GlassButton>

                <button
                  type="button"
                  onClick={() => handleDeletePlan(activePlan.id)}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                  title="Eliminar cronograma"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sessions grouped by date */}
            {sortedDates.length === 0 ? (
              <GlassCard padding="lg" className="text-center py-12 space-y-3">
                <Clock className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Este cronograma no tiene sesiones planificadas
                </h4>
                <p className="text-xs text-slate-400">
                  Pulsa en "+ Añadir Sesión" para programar tus bloques de estudio.
                </p>
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenAddSession()}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Añadir Primera Sesión
                </GlassButton>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {sortedDates.map((dateStr) => {
                  const daySessions = sessionsByDate[dateStr] || [];
                  const [y, m, d] = dateStr.split('-').map(Number);
                  const dateObj = new Date(y, m - 1, d);
                  const dayFormatted = dateObj.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  });
                  const capitalized = dayFormatted.charAt(0).toUpperCase() + dayFormatted.slice(1);
                  const dayTotalMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

                  return (
                    <GlassCard key={dateStr} padding="md" className="space-y-3 shadow-md">
                      {/* Day Header */}
                      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-500" /> {capitalized}
                          </span>
                          <span className="text-xs text-slate-400">({dateStr})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg">
                            {formatMinutes(dayTotalMins)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenAddSession(dateStr)}
                            className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold p-1"
                            title="Añadir sesión a este día"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Day Sessions List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {daySessions.map((sess) => {
                          const sub = subjects.find((s) => s.id === sess.subjectId);
                          const DayPartIcon =
                            sess.dayPart === 'mañana'
                              ? Sun
                              : sess.dayPart === 'tarde'
                              ? Sunset
                              : Moon;
                          const dayPartLabel =
                            sess.dayPart === 'mañana'
                              ? 'Mañana'
                              : sess.dayPart === 'tarde'
                              ? 'Tarde'
                              : sess.dayPart === 'noche'
                              ? 'Noche'
                              : 'Libre';

                          return (
                            <div
                              key={sess.id}
                              className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/10 flex flex-col justify-between gap-3 group hover:border-indigo-400/50 transition-all shadow-sm"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  {sub && (
                                    <span
                                      style={{ backgroundColor: sub.color }}
                                      className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full truncate max-w-[150px]"
                                    >
                                      {sub.name}
                                    </span>
                                  )}

                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                    <DayPartIcon className="w-3.5 h-3.5 text-amber-500" />
                                    <span>{dayPartLabel}</span>
                                    {sess.time && <span className="font-mono">({sess.time})</span>}
                                  </div>
                                </div>

                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {sess.title}
                                </h4>

                                {sess.content && (
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                                    {sess.content}
                                  </p>
                                )}

                                {sess.notes && (
                                  <p className="text-[11px] text-slate-400 italic mt-1">
                                    Nota: {sess.notes}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-white/5 text-xs">
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                  {formatMinutes(sess.durationMinutes)}
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditSession(sess)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title="Editar sesión"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSession(sess.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                    title="Eliminar sesión"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Plan Create / Edit Modal */}
      <CronogramaModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        initialData={editingPlan}
        onSave={handleSavePlan}
      />

      {/* Session Edit Modal */}
      {activePlan && (
        <SessionEditModal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          initialData={editingSession}
          planId={activePlan.id}
          defaultDate={sessionTargetDate}
          onSave={handleSaveSession}
        />
      )}
    </div>
  );
};

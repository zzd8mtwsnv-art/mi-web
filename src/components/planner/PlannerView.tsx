import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyPlan, StudyPlanMilestone } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString, formatMinutes } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/sound';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  BookOpen,
  ArrowRight,
  Target,
  BrainCircuit
} from 'lucide-react';

export const PlannerView: React.FC = () => {
  const {
    exams,
    subjects,
    plans,
    addStudyPlan,
    deleteStudyPlan,
    togglePlanMilestone,
    addTask
  } = useApp();

  // Generator Form State
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [planTitle, setPlanTitle] = useState('Plan de Estudio Trimestral');
  const [examDate, setExamDate] = useState(
    exams[0]?.date || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [rawTopics, setRawTopics] = useState(
    'Tema 1: Matrices y Operaciones, Tema 2: Rango y Determinantes, Tema 3: Discusión de Sistemas'
  );
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [dailyMinutes, setDailyMinutes] = useState<number>(60);
  const [isGenerating, setIsGenerating] = useState(false);

  // When exam changes, fill subject & date automatically
  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
    const exam = exams.find((e) => e.id === examId);
    if (exam) {
      setSelectedSubjectId(exam.subjectId);
      setExamDate(exam.date);
      setPlanTitle(`Plan para ${exam.title}`);
      if (exam.topics) setRawTopics(exam.topics);
    }
  };

  // Generate automated study milestones
  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const topicsList = rawTopics
      .split(/,|\n/)
      .map((t) => t.trim())
      .filter(Boolean);

    // Calculate days available
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(examDate);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.max(1, Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const milestones: StudyPlanMilestone[] = [];

    // Phase distribution algorithm
    // 1. Initial deep study of each topic
    // 2. Summary & formula sheet creation
    // 3. Problem solving & past exams
    // 4. Final comprehensive review
    let currentDayOffset = 0;

    topicsList.forEach((topic, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() + Math.min(diffDays - 1, currentDayOffset));
      milestones.push({
        id: `ms-${Date.now()}-${idx}-1`,
        dayNumber: currentDayOffset + 1,
        date: d.toISOString().split('T')[0],
        title: `Estudio y comprensión: ${topic}`,
        topics: topic,
        type: 'estudio',
        durationMinutes: dailyMinutes,
        completed: false
      });
      currentDayOffset++;
    });

    // Practical exercises phase
    topicsList.forEach((topic, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() + Math.min(diffDays - 1, currentDayOffset));
      milestones.push({
        id: `ms-${Date.now()}-${idx}-2`,
        dayNumber: currentDayOffset + 1,
        date: d.toISOString().split('T')[0],
        title: `Práctica y problemas: ${topic}`,
        topics: topic,
        type: 'ejercicios',
        durationMinutes: dailyMinutes,
        completed: false
      });
      currentDayOffset++;
    });

    // Final Review phase (1-2 days before exam)
    const reviewDate = new Date(target);
    reviewDate.setDate(target.getDate() - 1);
    milestones.push({
      id: `ms-${Date.now()}-final`,
      dayNumber: Math.max(1, diffDays),
      date: reviewDate.toISOString().split('T')[0],
      title: 'Repaso general y simulacro de examen',
      topics: 'Todos los temas',
      type: 'repaso',
      durationMinutes: Math.min(120, dailyMinutes * 1.5),
      completed: false
    });

    addStudyPlan({
      subjectId: selectedSubjectId,
      title: planTitle,
      examDate,
      difficulty,
      dailyStudyMinutes: dailyMinutes,
      topics: topicsList,
      milestones,
      ...(selectedExamId ? { examId: selectedExamId } : {})
    });

    confetti({ particleCount: 50, spread: 60 });
    soundManager.playCompletionChime();
    setIsGenerating(false);
  };

  // Convert milestone into a real task
  const handleExportMilestoneToTask = (ms: StudyPlanMilestone, subId: string) => {
    addTask({
      title: ms.title,
      description: `Hito generado desde el planificador: ${ms.topics}`,
      subjectId: subId,
      dueDate: ms.date,
      priority: 'alta',
      status: 'pendiente',
      estimatedMinutes: ms.durationMinutes
    });
    alert('¡Hito convertido en Tarea exitosamente!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-indigo-500" /> Planificador Inteligente de Estudio
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Distribuye automáticamente tus temas entre los días disponibles hasta la fecha del examen, optimizando las fases de estudio, problemas y repaso final.
        </p>
      </div>

      {/* Generator Form */}
      <GlassCard padding="lg" className="shadow-xl">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-500" /> Configurar Nuevo Plan de Examen
        </h2>

        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Exam selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Seleccionar Examen (opcional)
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => handleExamChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
              >
                <option value="">Personalizado / Sin examen vinculado</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.date})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Asignatura *
              </label>
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha del Examen *
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título del Plan
            </label>
            <input
              type="text"
              required
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              placeholder="Ej. Plan de Estudio Bloque Álgebra..."
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Temas / Bloques que entran (separados por comas)
            </label>
            <textarea
              rows={2}
              required
              value={rawTopics}
              onChange={(e) => setRawTopics(e.target.value)}
              placeholder="Tema 1: Matrices, Tema 2: Determinantes, Tema 3: Sistemas..."
              className="w-full px-3.5 py-2 rounded-2xl glass-input text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nivel de Dificultad
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'facil', label: 'Fácil' },
                  { id: 'medio', label: 'Medio' },
                  { id: 'dificil', label: 'Difícil' }
                ].map((df) => (
                  <button
                    key={df.id}
                    type="button"
                    onClick={() => setDifficulty(df.id as 'facil' | 'medio' | 'dificil')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      difficulty === df.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/10'
                    }`}
                  >
                    {df.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tiempo de estudio diario: <span className="font-bold text-indigo-600">{formatMinutes(dailyMinutes)}</span>
              </label>
              <input
                type="range"
                min="30"
                max="180"
                step="15"
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="w-full accent-indigo-500 mt-2"
              />
            </div>
          </div>

          <div className="pt-2">
            <GlassButton
              variant="primary"
              type="submit"
              icon={<Sparkles className="w-4 h-4" />}
            >
              {isGenerating ? 'Calculando Plan...' : 'Generar Planificación Automática'}
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      {/* ACTIVE PLANS LIST */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Tus Planes de Estudio ({plans.length})
        </h2>

        {plans.length === 0 ? (
          <GlassCard padding="lg" className="text-center py-10">
            <p className="text-sm text-slate-500">
              No tienes ningún plan generado. ¡Usa el formulario superior para crear uno!
            </p>
          </GlassCard>
        ) : (
          plans.map((plan) => {
            const sub = subjects.find((s) => s.id === plan.subjectId);
            const completedCount = plan.milestones.filter((m) => m.completed).length;
            const progressPercent = Math.round((completedCount / plan.milestones.length) * 100);

            return (
              <GlassCard key={plan.id} padding="lg" className="space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {sub && (
                        <span
                          style={{ color: sub.color }}
                          className="text-xs font-bold"
                        >
                          {sub.name}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        • Examen el {plan.examDate}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {plan.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">
                        Progreso del Plan
                      </span>
                      <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                        {completedCount} / {plan.milestones.length} hitos ({progressPercent}%)
                      </span>
                    </div>

                    <button
                      onClick={() => deleteStudyPlan(plan.id)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Eliminar plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Milestones Roadmap */}
                <div className="space-y-2.5">
                  {plan.milestones.map((ms) => {
                    const typeColor =
                      ms.type === 'estudio'
                        ? 'bg-blue-500'
                        : ms.type === 'ejercicios'
                        ? 'bg-amber-500'
                        : ms.type === 'resumen'
                        ? 'bg-purple-500'
                        : 'bg-rose-500';

                    return (
                      <div
                        key={ms.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          ms.completed
                            ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-500/30 opacity-75'
                            : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-white/5 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={ms.completed}
                            onChange={() => togglePlanMilestone(plan.id, ms.id)}
                            className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                          />
                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                ms.completed
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {ms.title}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span>Fecha: {ms.date}</span>
                              <span>• {formatMinutes(ms.durationMinutes)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider ${typeColor}`}
                          >
                            {ms.type}
                          </span>

                          <button
                            onClick={() => handleExportMilestoneToTask(ms, plan.subjectId)}
                            className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 text-slate-500 transition-colors flex items-center gap-1"
                            title="Convertir a tarea"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> +Tarea
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyPlan, PlannedStudySession, PlanType, DayPart, Priority } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString, formatMinutes } from '../../utils/dateUtils';
import { parseTopicsIntelligently } from '../../utils/topicParser';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/sound';
import {
  Sparkles,
  Calendar,
  Clock,
  Plus,
  Trash2,
  BookOpen,
  ArrowRight,
  Target,
  BrainCircuit,
  CalendarRange,
  Layers,
  CheckCircle2,
  Sun,
  Sunset,
  Moon,
  AlertCircle,
  Loader2,
  ListTodo,
  FileText
} from 'lucide-react';

export const PlannerView: React.FC = () => {
  const {
    exams,
    subjects,
    tasks,
    customEvents,
    savePlanAndSync,
    setActiveView
  } = useApp();

  // Mode: 'examen' | 'periodo_global'
  const [plannerMode, setPlannerMode] = useState<PlanType>('examen');

  // Modo A (Examen) Form State
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [planTitle, setPlanTitle] = useState('Plan de Estudio');
  const [examDate, setExamDate] = useState(
    exams[0]?.date || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [rawTopics, setRawTopics] = useState(
    'Tema 1: Matrices y Operaciones, Tema 2: Rango y Determinantes, Tema 3: Discusión de Sistemas'
  );
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [dailyMinutes, setDailyMinutes] = useState<number>(60);

  // Modo B (Periodo Global) Form State
  const [globalPeriodOption, setGlobalPeriodOption] = useState<
    'esta_semana' | 'proxima_semana' | 'proximas_2_semanas' | 'este_mes' | 'proximo_mes' | 'personalizado'
  >('proximas_2_semanas');
  const [globalStartDate, setGlobalStartDate] = useState(getTodayDateString());
  const [globalEndDate, setGlobalEndDate] = useState(
    new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]
  );
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Preview & Saving State
  const [previewPlan, setPreviewPlan] = useState<Omit<StudyPlan, 'id' | 'createdAt'> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Handle Exam selection in Modo A
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

  // Handle Global Period quick selector in Modo B
  const handlePeriodOptionChange = (
    opt: 'esta_semana' | 'proxima_semana' | 'proximas_2_semanas' | 'este_mes' | 'proximo_mes' | 'personalizado'
  ) => {
    setGlobalPeriodOption(opt);
    const today = new Date();
    const todayStr = getTodayDateString();

    if (opt === 'esta_semana') {
      const day = today.getDay(); // 0 is Sun, 1 is Mon
      const diffToMon = day === 0 ? -6 : 1 - day;
      const mon = new Date(today);
      mon.setDate(today.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      setGlobalStartDate(mon.toISOString().split('T')[0]);
      setGlobalEndDate(sun.toISOString().split('T')[0]);
      setPlanTitle('Planificación: Esta Semana');
    } else if (opt === 'proxima_semana') {
      const day = today.getDay();
      const diffToNextMon = day === 0 ? 1 : 8 - day;
      const nextMon = new Date(today);
      nextMon.setDate(today.getDate() + diffToNextMon);
      const nextSun = new Date(nextMon);
      nextSun.setDate(nextMon.getDate() + 6);
      setGlobalStartDate(nextMon.toISOString().split('T')[0]);
      setGlobalEndDate(nextSun.toISOString().split('T')[0]);
      setPlanTitle('Planificación: Próxima Semana');
    } else if (opt === 'proximas_2_semanas') {
      const end = new Date(today);
      end.setDate(today.getDate() + 14);
      setGlobalStartDate(todayStr);
      setGlobalEndDate(end.toISOString().split('T')[0]);
      setPlanTitle('Planificación: Próximas 2 Semanas');
    } else if (opt === 'este_mes') {
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setGlobalStartDate(todayStr);
      setGlobalEndDate(lastDayOfMonth.toISOString().split('T')[0]);
      setPlanTitle('Planificación: Resto de este Mes');
    } else if (opt === 'proximo_mes') {
      const firstDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const lastDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      setGlobalStartDate(firstDayNextMonth.toISOString().split('T')[0]);
      setGlobalEndDate(lastDayNextMonth.toISOString().split('T')[0]);
      setPlanTitle('Planificación: Próximo Mes');
    } else {
      setGlobalStartDate(todayStr);
      const end = new Date(today);
      end.setDate(today.getDate() + 7);
      setGlobalEndDate(end.toISOString().split('T')[0]);
      setPlanTitle('Planificación Personalizada');
    }
  };

  // GENERATOR FUNCTION
  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setSaveError(null);
    setSaveSuccessMsg(null);

    const generatedSessions: PlannedStudySession[] = [];
    const todayStr = getTodayDateString();

    if (plannerMode === 'examen') {
      // --- MODO A: EXAMEN ESPECÍFICO ---
      const topicsList = parseTopicsIntelligently(rawTopics);
      const targetDate = examDate;
      const startDate = todayStr;

      const [y1, m1, d1] = startDate.split('-').map(Number);
      const [y2, m2, d2] = targetDate.split('-').map(Number);
      const dateStartObj = new Date(y1, m1 - 1, d1);
      const dateTargetObj = new Date(y2, m2 - 1, d2);

      const diffDays = Math.max(1, Math.round((dateTargetObj.getTime() - dateStartObj.getTime()) / (1000 * 60 * 60 * 24)));

      // Day parts to alternate between for realism
      const dayPartsCycle: DayPart[] = ['tarde', 'mañana', 'noche'];

      // If we have topics, distribute them
      if (topicsList.length > 0) {
        // Phase 1: Study & understanding (allocate topics across available study days)
        const studyDaysCount = Math.max(1, diffDays - 1); // reserve last day for final review
        const topicsPerDay = Math.max(1, Math.ceil(topicsList.length / studyDaysCount));

        let topicIdx = 0;
        let dayOffset = 0;

        while (topicIdx < topicsList.length && dayOffset < studyDaysCount) {
          const currentDayTopics: string[] = [];
          for (let i = 0; i < topicsPerDay && topicIdx < topicsList.length; i++) {
            currentDayTopics.push(topicsList[topicIdx]);
            topicIdx++;
          }

          const d = new Date(dateStartObj);
          d.setDate(dateStartObj.getDate() + dayOffset);
          const sessionDateStr = d.toISOString().split('T')[0];
          const part = dayPartsCycle[dayOffset % dayPartsCycle.length];

          // Study session
          const contentText = currentDayTopics.join(', ');
          const titleText = currentDayTopics.length === 1
            ? `Estudio: ${currentDayTopics[0]}`
            : `Estudio: ${currentDayTopics[0]} - ${currentDayTopics[currentDayTopics.length - 1]}`;

          generatedSessions.push({
            id: `temp-sess-${Date.now()}-${dayOffset}-1`,
            planId: 'temp-plan',
            date: sessionDateStr,
            dayPart: part,
            subjectId: selectedSubjectId,
            title: titleText,
            content: contentText,
            durationMinutes: dailyMinutes,
            completed: false
          });

          // If difficulty is alta/dificil or dailyMinutes >= 60, add practical problems block
          if (difficulty === 'dificil' && currentDayTopics.length > 0) {
            generatedSessions.push({
              id: `temp-sess-${Date.now()}-${dayOffset}-2`,
              planId: 'temp-plan',
              date: sessionDateStr,
              dayPart: part === 'tarde' ? 'noche' : 'tarde',
              subjectId: selectedSubjectId,
              title: `Práctica y problemas: ${currentDayTopics[0]}`,
              content: `Ejercicios prácticos de ${contentText}`,
              durationMinutes: Math.min(45, dailyMinutes),
              completed: false
            });
          }

          dayOffset++;
        }

        // Final Comprehensive Review (day before exam)
        const reviewDate = new Date(dateTargetObj);
        reviewDate.setDate(dateTargetObj.getDate() - 1);
        const reviewDateStr = reviewDate.toISOString().split('T')[0];

        generatedSessions.push({
          id: `temp-sess-${Date.now()}-final-review`,
          planId: 'temp-plan',
          date: reviewDateStr,
          dayPart: 'tarde',
          subjectId: selectedSubjectId,
          title: 'Repaso general y simulacro de examen',
          content: `Repaso global de temario: ${topicsList.slice(0, 4).join(', ')}${topicsList.length > 4 ? '...' : ''}`,
          durationMinutes: Math.min(90, Math.round(dailyMinutes * 1.25)),
          completed: false
        });
      }

      setPreviewPlan({
        title: planTitle || 'Plan de Examen',
        type: 'examen',
        startDate,
        endDate: targetDate,
        examId: selectedExamId || undefined,
        examDate: targetDate,
        subjectId: selectedSubjectId,
        subjectIds: [selectedSubjectId],
        difficulty,
        dailyStudyMinutes: dailyMinutes,
        topics: topicsList,
        instructions: undefined,
        sessions: generatedSessions
      });

    } else {
      // --- MODO B: PERIODO GLOBAL ---
      const startDate = globalStartDate;
      const endDate = globalEndDate;

      const [y1, m1, d1] = startDate.split('-').map(Number);
      const [y2, m2, d2] = endDate.split('-').map(Number);
      const startObj = new Date(y1, m1 - 1, d1);
      const endObj = new Date(y2, m2 - 1, d2);
      const totalPeriodDays = Math.max(1, Math.round((endObj.getTime() - startObj.getTime()) / (86400000)) + 1);

      // 1. Lookahead window: scan 4 days beyond endDate for upcoming exams needing preparation during this range
      const lookaheadEndObj = new Date(endObj);
      lookaheadEndObj.setDate(endObj.getDate() + 4);
      const lookaheadEndStr = lookaheadEndObj.toISOString().split('T')[0];

      // Relevant exams in period and lookahead
      const relevantExams = exams.filter(
        (ex) => ex.date >= startDate && ex.date <= lookaheadEndStr
      );

      // Relevant tasks in period
      const relevantTasks = tasks.filter(
        (t) => t.status !== 'completada' && t.dueDate >= startDate && t.dueDate <= endDate
      );

      // Relevant custom events
      const relevantCustomEvents = customEvents.filter(
        (ev) => ev.date >= startDate && ev.date <= endDate
      );

      // Involved subjects
      const involvedSubjectIds = new Set<string>();
      relevantExams.forEach((e) => involvedSubjectIds.add(e.subjectId));
      relevantTasks.forEach((t) => { if (t.subjectId) involvedSubjectIds.add(t.subjectId); });
      relevantCustomEvents.forEach((ev) => { if (ev.subjectId) involvedSubjectIds.add(ev.subjectId); });

      // Fallback to all subjects if none specific found
      if (involvedSubjectIds.size === 0) {
        subjects.slice(0, 3).forEach((s) => involvedSubjectIds.add(s.id));
      }

      // 2. Schedule sessions for each academic requirement
      // A) Exam preparation sessions (2-3 blocks per exam scheduled before its date)
      relevantExams.forEach((ex) => {
        const [ey, em, ed] = ex.date.split('-').map(Number);
        const examDateObj = new Date(ey, em - 1, ed);

        // Schedule 2-3 sessions before the exam within our plan range
        const prepDays = [3, 2, 1];
        prepDays.forEach((daysBefore, idx) => {
          const prepDate = new Date(examDateObj);
          prepDate.setDate(examDateObj.getDate() - daysBefore);
          const prepDateStr = prepDate.toISOString().split('T')[0];

          // If within plan range
          if (prepDateStr >= startDate && prepDateStr <= endDate) {
            const sub = subjects.find((s) => s.id === ex.subjectId);
            const part: DayPart = idx % 2 === 0 ? 'tarde' : 'noche';
            generatedSessions.push({
              id: `global-exam-prep-${ex.id}-${daysBefore}`,
              planId: 'temp-plan',
              date: prepDateStr,
              dayPart: part,
              subjectId: ex.subjectId,
              title: `Preparación Examen: ${ex.title}`,
              content: ex.topics ? `Repaso: ${ex.topics}` : `Preparación para examen de ${sub?.name || 'materia'}`,
              durationMinutes: Math.min(60, dailyMinutes),
              completed: false
            });
          }
        });
      });

      // B) Task work sessions (1-2 days before due date)
      relevantTasks.forEach((t) => {
        if (!t.dueDate) return;
        const [ty, tm, td] = t.dueDate.split('-').map(Number);
        const taskDueObj = new Date(ty, tm - 1, td);

        const workDate = new Date(taskDueObj);
        workDate.setDate(taskDueObj.getDate() - 1);
        const workDateStr = workDate >= startObj ? workDate.toISOString().split('T')[0] : t.dueDate;

        if (workDateStr >= startDate && workDateStr <= endDate) {
          const sub = subjects.find((s) => s.id === t.subjectId);
          generatedSessions.push({
            id: `global-task-prep-${t.id}`,
            planId: 'temp-plan',
            date: workDateStr,
            dayPart: 'tarde',
            subjectId: t.subjectId,
            title: `Trabajo en Tarea: ${t.title}`,
            content: t.description || `Desarrollo de entrega para ${sub?.name || 'materia'}`,
            durationMinutes: t.estimatedMinutes || Math.min(45, dailyMinutes),
            completed: false
          });
        }
      });

      // C) Exposiciones / Eventos prep
      relevantCustomEvents
        .filter((ev) => ev.type === 'exposicion')
        .forEach((ev) => {
          const [ey, em, ed] = ev.date.split('-').map(Number);
          const evDateObj = new Date(ey, em - 1, ed);
          const prepDate = new Date(evDateObj);
          prepDate.setDate(evDateObj.getDate() - 1);
          const prepDateStr = prepDate >= startObj ? prepDate.toISOString().split('T')[0] : ev.date;

          if (prepDateStr >= startDate && prepDateStr <= endDate) {
            generatedSessions.push({
              id: `global-expo-prep-${ev.id}`,
              planId: 'temp-plan',
              date: prepDateStr,
              dayPart: 'mañana',
              subjectId: ev.subjectId,
              title: `Ensayo y preparación: ${ev.title}`,
              content: ev.description || 'Ensayo de exposición oral y revisión de material',
              durationMinutes: 30,
              completed: false
            });
          }
        });

      // D) Fill empty study days with balanced subject review according to daily limit
      const daysWithSessions = new Set(generatedSessions.map((s) => s.date));
      const subjectArray = Array.from(involvedSubjectIds);

      for (let i = 0; i < totalPeriodDays; i++) {
        const d = new Date(startObj);
        d.setDate(startObj.getDate() + i);
        const dStr = d.toISOString().split('T')[0];

        // If no session scheduled on this day, add a regular study block
        if (!daysWithSessions.has(dStr)) {
          const assignedSubId = subjectArray[i % subjectArray.length];
          const sub = subjects.find((s) => s.id === assignedSubId);

          generatedSessions.push({
            id: `global-routine-${i}`,
            planId: 'temp-plan',
            date: dStr,
            dayPart: 'tarde',
            subjectId: assignedSubId,
            title: `Estudio y consolidación: ${sub?.name || 'Materia'}`,
            content: 'Repaso de apuntes y lectura de conceptos clave',
            durationMinutes: dailyMinutes,
            completed: false
          });
        }
      }

      // Sort sessions chronologically
      generatedSessions.sort((a, b) => a.date.localeCompare(b.date));

      setPreviewPlan({
        title: planTitle || 'Planificación Global',
        type: 'periodo_global',
        startDate,
        endDate,
        subjectIds: subjectArray,
        difficulty: 'medio',
        dailyStudyMinutes: dailyMinutes,
        instructions: additionalInstructions.trim() || undefined,
        sessions: generatedSessions
      });
    }

    setIsGenerating(false);
    confetti({ particleCount: 60, spread: 60 });
    soundManager.playCompletionChime();
  };

  // SAVE PLAN CONFIRMATION WITH FIRESTORE
  const handleSavePlan = async () => {
    if (!previewPlan) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await savePlanAndSync(previewPlan);

      if (result.success) {
        soundManager.playCompletionChime();
        confetti({ particleCount: 80, spread: 70 });
        setSaveSuccessMsg('¡Planificación guardada con éxito en Cronograma!');
        // Clear preview only upon confirmed save
        setPreviewPlan(null);
        // Reset form
        setPlanTitle('Plan de Estudio');
      } else {
        setSaveError(result.error || 'Error al guardar en la nube. Tu vista previa se conserva para reintentar.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Error inesperado al guardar la planificación.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePreviewSession = (sessId: string) => {
    if (!previewPlan) return;
    setPreviewPlan({
      ...previewPlan,
      sessions: previewPlan.sessions?.filter((s) => s.id !== sessId) || []
    });
  };

  // Group preview sessions by date
  const sessionsByDate: Record<string, PlannedStudySession[]> = {};
  if (previewPlan?.sessions) {
    previewPlan.sessions.forEach((s) => {
      if (!sessionsByDate[s.date]) {
        sessionsByDate[s.date] = [];
      }
      sessionsByDate[s.date].push(s);
    });
  }

  const sortedDates = Object.keys(sessionsByDate).sort();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-indigo-500" /> Planificador Inteligente de Estudio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Genera planes de estudio avanzados para exámenes o periodos globales con interpretación de temarios y guardado directo en tu Cronograma.
          </p>
        </div>

        <GlassButton
          variant="secondary"
          onClick={() => setActiveView('cronograma')}
          icon={<CalendarRange className="w-4 h-4 text-indigo-500" />}
        >
          Ver Cronogramas Guardados
        </GlassButton>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-bold">{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActiveView('cronograma')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Abrir Cronograma <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
          </button>
        </div>
      )}

      {/* Error Alert Banner */}
      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <div className="text-xs font-semibold">{saveError}</div>
        </div>
      )}

      {/* Generator Configuration Panel */}
      <GlassCard padding="lg" className="shadow-xl">
        {/* Mode Selector Tabs (Modo A: Examen vs Modo B: Periodo Global) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10 mb-6">
          <button
            type="button"
            onClick={() => {
              setPlannerMode('examen');
              setPlanTitle('Plan de Examen');
            }}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              plannerMode === 'examen'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            A) Examen Específico
          </button>

          <button
            type="button"
            onClick={() => {
              setPlannerMode('periodo_global');
              setPlanTitle('Planificación: Próximas 2 Semanas');
            }}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              plannerMode === 'periodo_global'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            B) Periodo Global (Semana / Mes)
          </button>
        </div>

        <form onSubmit={handleGeneratePlan} className="space-y-4">
          {/* MODO A: EXAMEN ESPECÍFICO */}
          {plannerMode === 'examen' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Exam selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Seleccionar Examen
                  </label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => handleExamChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-medium"
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
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-medium"
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
                  placeholder="Ej. Plan para Examen de Física..."
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-semibold"
                />
              </div>

              {/* Smart Topics Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Temas / Bloques que entran (Interpretación Inteligente) *
                  </label>
                  <span className="text-[11px] text-indigo-500 font-medium">
                    Ej: "Tengo 15 apartados", "8 temas", o "Tema 1: ..., Tema 2: ..."
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={rawTopics}
                  onChange={(e) => setRawTopics(e.target.value)}
                  placeholder="Ej: Tengo 15 apartados | MRU, MRUA, caída libre, tiro parabólico | Tema 1: Matrices, Tema 2: Determinantes..."
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm leading-relaxed"
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
                    Tiempo de estudio diario objetivo: <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatMinutes(dailyMinutes)}</span>
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
            </>
          )}

          {/* MODO B: PERIODO GLOBAL */}
          {plannerMode === 'periodo_global' && (
            <>
              {/* Quick Period Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Seleccionar Periodo a Planificar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    { id: 'esta_semana', label: 'Esta Semana' },
                    { id: 'proxima_semana', label: 'Próx. Semana' },
                    { id: 'proximas_2_semanas', label: 'Próx. 2 Semanas' },
                    { id: 'este_mes', label: 'Este Mes' },
                    { id: 'proximo_mes', label: 'Próximo Mes' },
                    { id: 'personalizado', label: 'Personalizado' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePeriodOptionChange(p.id as any)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                        globalPeriodOption === p.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start and End Date row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={globalStartDate}
                    onChange={(e) => setGlobalStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    required
                    value={globalEndDate}
                    onChange={(e) => setGlobalEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dedicación diaria máxima: <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatMinutes(dailyMinutes)}</span>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título del Plan Global
                </label>
                <input
                  type="text"
                  required
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="Ej. Planificación Trimestral Octubre..."
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-semibold"
                />
              </div>

              {/* Optional Additional Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Indicaciones adicionales (opcional)
                </label>
                <input
                  type="text"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="Ej: Quiero priorizar Matemáticas y Física, o tengo poco tiempo los jueves..."
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
                />
              </div>

              {/* Academic Overview Box */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-500/20 text-xs space-y-1">
                <span className="font-bold text-indigo-950 dark:text-indigo-200 block">
                  🔍 Análisis automático de tu agenda:
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  El planificador analizará automáticamente todas tus tareas pendientes, exámenes programados, exposiciones y recordatorios dentro del periodo, incluyendo los exámenes cercanos que requieran estudio anticipado.
                </p>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between">
            <GlassButton
              variant="primary"
              type="submit"
              disabled={isGenerating}
              icon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            >
              {isGenerating ? 'Calculando Plan...' : 'Generar Vista Previa de Planificación'}
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      {/* VISTA PREVIA INTERACTIVA (ONLY DISPLAYED WHEN GENERATED) */}
      {previewPlan && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
            <div>
              <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300" /> Vista Previa de la Planificación Generada
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">
                {previewPlan.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-indigo-100">
                <span>📅 {previewPlan.startDate} → {previewPlan.endDate}</span>
                <span>•</span>
                <span>📚 {previewPlan.sessions?.length || 0} sesiones planificadas</span>
                <span>•</span>
                <span>⏱️ {formatMinutes(previewPlan.sessions?.reduce((acc, s) => acc + s.durationMinutes, 0) || 0)} totales</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewPlan(null)}
                className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
              >
                Descartar
              </button>

              <GlassButton
                variant="primary"
                onClick={handleSavePlan}
                disabled={isSaving}
                icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                className="!bg-white !text-indigo-600 hover:!bg-indigo-50 font-extrabold shadow-lg"
              >
                {isSaving ? 'Guardando en la nube...' : 'Guardar en Cronograma'}
              </GlassButton>
            </div>
          </div>

          {/* Daily Roadmap Breakdown */}
          <div className="space-y-3">
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

              return (
                <GlassCard key={dateStr} padding="md" className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {capitalized}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {dateStr}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                          : 'Noche';

                      return (
                        <div
                          key={sess.id}
                          className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/10 flex flex-col justify-between gap-2 shadow-sm"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              {sub && (
                                <span
                                  style={{ backgroundColor: sub.color }}
                                  className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full truncate max-w-[140px]"
                                >
                                  {sub.name}
                                </span>
                              )}
                              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                <DayPartIcon className="w-3 h-3 text-amber-500" /> {dayPartLabel}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {sess.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {sess.content}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-white/5 text-xs">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {sess.durationMinutes} min
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemovePreviewSession(sess.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              title="Quitar sesión de la vista previa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


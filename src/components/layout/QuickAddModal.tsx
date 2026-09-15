import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { CheckSquare, FileText, BookOpen, Clock, Calendar, Sparkles } from 'lucide-react';
import { Priority, CustomEventType } from '../../types';
import { getTodayDateString } from '../../utils/dateUtils';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    subjects,
    addTask,
    addExam,
    addSubject,
    addFocusSession,
    addCustomEvent
  } = useApp();

  const [activeTab, setActiveTab] = useState<'task' | 'exam' | 'event' | 'subject' | 'session'>('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState(subjects[0]?.id || '');
  const [taskDueDate, setTaskDueDate] = useState(getTodayDateString());
  const [taskPriority, setTaskPriority] = useState<Priority>('media');

  // Exam form state
  const [examTitle, setExamTitle] = useState('');
  const [examSubjectId, setExamSubjectId] = useState(subjects[0]?.id || '');
  const [examDate, setExamDate] = useState(getTodayDateString());
  const [examImportance, setExamImportance] = useState<'normal' | 'alta' | 'crucial'>('alta');

  // Custom Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<CustomEventType>('evento');
  const [eventDate, setEventDate] = useState(getTodayDateString());
  const [eventSubjectId, setEventSubjectId] = useState(subjects[0]?.id || '');
  const [eventTime, setEventTime] = useState('10:00');

  // Subject form state
  const [subName, setSubName] = useState('');
  const [subColor, setSubColor] = useState('#6366F1');
  const [subTeacher, setSubTeacher] = useState('');

  // Quick Study Session Log
  const [sessionSubjectId, setSessionSubjectId] = useState(subjects[0]?.id || '');
  const [sessionMins, setSessionMins] = useState(45);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      dueDate: taskDueDate,
      priority: taskPriority,
      status: 'pendiente',
      ...(taskSubjectId ? { subjectId: taskSubjectId } : {})
    });
    setTaskTitle('');
    setIsQuickAddOpen(false);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;
    addExam({
      title: examTitle.trim(),
      subjectId: examSubjectId,
      date: examDate,
      importance: examImportance
    });
    setExamTitle('');
    setIsQuickAddOpen(false);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    addCustomEvent({
      title: eventTitle.trim(),
      type: eventType,
      date: eventDate,
      time: eventTime,
      color: eventType === 'evento' ? '#8B5CF6' : eventType === 'exposicion' ? '#F59E0B' : '#06B6D4',
      completed: false,
      ...(eventSubjectId ? { subjectId: eventSubjectId } : {})
    });
    setEventTitle('');
    setIsQuickAddOpen(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;
    addSubject({
      name: subName.trim(),
      color: subColor,
      icon: 'BookOpen',
      ...(subTeacher.trim() ? { teacher: subTeacher.trim() } : {})
    });
    setSubName('');
    setIsQuickAddOpen(false);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    addFocusSession({
      durationMinutes: Number(sessionMins),
      type: 'normal',
      date: new Date().toISOString(),
      completed: true,
      notes: 'Sesión registrada manualmente',
      ...(sessionSubjectId ? { subjectId: sessionSubjectId } : {})
    });
    setIsQuickAddOpen(false);
  };

  return (
    <GlassModal
      isOpen={isQuickAddOpen}
      onClose={() => setIsQuickAddOpen(false)}
      title="Creación Rápida"
      subtitle="Añade un nuevo elemento a tu flujo de trabajo"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('task')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === 'task'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" /> Tarea
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exam')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === 'exam'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Examen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('event')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === 'event'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Evento
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subject')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === 'subject'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Materia
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('session')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === 'session'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Estudio
          </button>
        </div>

        {/* Tarea Form */}
        {activeTab === 'task' && (
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Título de la tarea
              </label>
              <input
                autoFocus
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Ej. Ejercicios tema 4 de Matemáticas..."
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Asignatura
                </label>
                <select
                  value={taskSubjectId}
                  onChange={(e) => setTaskSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl glass-input text-sm"
                >
                  <option value="">General</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Fecha límite
                </label>
                <input
                  type="date"
                  required
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Prioridad
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['baja', 'media', 'alta', 'urgente'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTaskPriority(p)}
                    className={`py-1.5 text-xs font-medium rounded-xl border capitalize transition-all ${
                      taskPriority === p
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <GlassButton variant="primary" fullWidth type="submit">
              Guardar Tarea
            </GlassButton>
          </form>
        )}

        {/* Examen Form */}
        {activeTab === 'exam' && (
          <form onSubmit={handleCreateExam} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nombre del Examen / Bloque
              </label>
              <input
                autoFocus
                type="text"
                required
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Ej. Examen Evaluación Bloque I..."
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Asignatura
                </label>
                <select
                  value={examSubjectId}
                  onChange={(e) => setExamSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl glass-input text-sm"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Fecha del examen
                </label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl glass-input text-sm"
                />
              </div>
            </div>

            <GlassButton variant="primary" fullWidth type="submit">
              Guardar Examen
            </GlassButton>
          </form>
        )}

        {/* Evento Form (Evento, Exposición, Recordatorio) */}
        {activeTab === 'event' && (
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tipo de Entrada
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'evento', label: 'Evento', color: 'text-purple-500' },
                  { id: 'exposicion', label: 'Exposición', color: 'text-amber-500' },
                  { id: 'recordatorio', label: 'Recordatorio', color: 'text-cyan-500' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEventType(t.id as CustomEventType)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      eventType === t.id
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border-indigo-500/40'
                        : 'bg-white/40 dark:bg-slate-800/40 text-slate-500 border-slate-200/50 dark:border-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Título *
              </label>
              <input
                autoFocus
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Ej. Vacaciones, Exposición oral de Historia, Llevar calculadora..."
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Hora
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl glass-input text-sm"
                />
              </div>
            </div>

            <GlassButton variant="primary" fullWidth type="submit">
              Guardar en Calendario
            </GlassButton>
          </form>
        )}

        {/* Asignatura Form */}
        {activeTab === 'subject' && (
          <form onSubmit={handleCreateSubject} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nombre de la Asignatura
              </label>
              <input
                autoFocus
                type="text"
                required
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="Ej. Filosofía, Química..."
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Profesor (opcional)
              </label>
              <input
                type="text"
                value={subTeacher}
                onChange={(e) => setSubTeacher(e.target.value)}
                placeholder="Ej. Dña. Carmen López"
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
              />
            </div>

            <GlassButton variant="primary" fullWidth type="submit">
              Crear Asignatura
            </GlassButton>
          </form>
        )}

        {/* Registro Estudio Manual */}
        {activeTab === 'session' && (
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Asignatura estudiada
              </label>
              <select
                value={sessionSubjectId}
                onChange={(e) => setSessionSubjectId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl glass-input text-sm"
              >
                <option value="">Estudio General</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Minutos estudiados: {sessionMins} min
              </label>
              <input
                type="range"
                min="10"
                max="240"
                step="5"
                value={sessionMins}
                onChange={(e) => setSessionMins(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <GlassButton variant="primary" fullWidth type="submit">
              Registrar Estudio
            </GlassButton>
          </form>
        )}
      </div>
    </GlassModal>
  );
};
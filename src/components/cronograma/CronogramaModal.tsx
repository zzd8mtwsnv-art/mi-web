import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyPlan, PlanType } from '../../types';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { getTodayDateString, formatMinutes } from '../../utils/dateUtils';
import { CalendarRange, Calendar, Clock, CheckCircle2, BookOpen } from 'lucide-react';

interface CronogramaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: StudyPlan | null;
  onSave: (data: Omit<StudyPlan, 'id' | 'createdAt'>) => void;
}

export const CronogramaModal: React.FC<CronogramaModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave
}) => {
  const { subjects } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<PlanType>('manual');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState<number>(60);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setType(initialData.type || 'manual');
      setStartDate(initialData.startDate || initialData.createdAt?.split('T')[0] || getTodayDateString());
      setEndDate(initialData.endDate || initialData.examDate || getTodayDateString());
      setDailyStudyMinutes(initialData.dailyStudyMinutes || 60);
      setSelectedSubjectIds(initialData.subjectIds || (initialData.subjectId ? [initialData.subjectId] : []));
      setInstructions(initialData.instructions || '');
    } else {
      setTitle('Mi Plan de Estudio');
      setType('manual');
      setStartDate(getTodayDateString());
      setEndDate(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
      setDailyStudyMinutes(60);
      setSelectedSubjectIds(subjects.slice(0, 3).map((s) => s.id));
      setInstructions('');
    }
  }, [initialData, isOpen, subjects]);

  const toggleSubject = (subId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      type,
      startDate,
      endDate,
      dailyStudyMinutes,
      subjectIds: selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined,
      subjectId: selectedSubjectIds[0] || undefined,
      instructions: instructions.trim() || undefined,
      sessions: initialData?.sessions || []
    });

    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Cronograma' : 'Nuevo Cronograma Manual'}
      subtitle={initialData ? 'Modifica el título y fechas de tu planificación' : 'Crea un cronograma y organízale sesiones de estudio a tu medida'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Título del Cronograma *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Semana 21–27 septiembre / Repaso Trimestral"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold"
          />
        </div>

        {/* Fechas Inicio y Fin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Fecha de Inicio *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Fecha de Fin *
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-medium"
            />
          </div>
        </div>

        {/* Asignaturas Involucradas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Asignaturas Principales
          </label>
          <div className="flex flex-wrap gap-1.5">
            {subjects.map((s) => {
              const isSelected = selectedSubjectIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSubject(s.id)}
                  style={{
                    backgroundColor: isSelected ? s.color : undefined,
                    borderColor: s.color
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'text-white shadow-sm'
                      : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dedicación diaria */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Meta de estudio diaria recomendada: <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatMinutes(dailyStudyMinutes)}</span>
          </label>
          <input
            type="range"
            min="30"
            max="240"
            step="15"
            value={dailyStudyMinutes}
            onChange={(e) => setDailyStudyMinutes(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Indicaciones / Notas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notas u objetivos del plan (opcional)
          </label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ej: Dedicar más tiempo a los problemas de física..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            size="sm"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {initialData ? 'Guardar Cambios' : 'Crear Cronograma'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};

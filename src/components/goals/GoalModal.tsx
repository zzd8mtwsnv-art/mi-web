import React, { useState, useEffect } from 'react';
import { Goal, GoalType } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Goal, 'id'>) => void;
  initialData?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { subjects } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GoalType>('daily_time');
  const [targetValue, setTargetValue] = useState<number>(120);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('min');
  const [subjectId, setSubjectId] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setType(initialData.type);
      setTargetValue(initialData.targetValue);
      setCurrentValue(initialData.currentValue);
      setUnit(initialData.unit);
      setSubjectId(initialData.subjectId || '');
      setDeadline(initialData.deadline || '');
    } else {
      setTitle('');
      setDescription('');
      setType('daily_time');
      setTargetValue(120);
      setCurrentValue(0);
      setUnit('min');
      setSubjectId('');
      setDeadline('');
    }
  }, [initialData, isOpen]);

  const handleTypeChange = (newType: GoalType) => {
    setType(newType);
    if (newType === 'daily_time') {
      setTitle('Estudiar 2 horas diarias');
      setTargetValue(120);
      setUnit('min');
    } else if (newType === 'weekly_tasks') {
      setTitle('Completar 6 tareas esta semana');
      setTargetValue(6);
      setUnit('tareas');
    } else if (newType === 'subject_grade') {
      setTitle('Superar nota objetivo en materia');
      setTargetValue(8.5);
      setUnit('pts');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const goalData: Omit<Goal, 'id'> = {
      title: title.trim(),
      type,
      targetValue: Number(targetValue),
      currentValue: Number(currentValue),
      unit,
      completed: Number(currentValue) >= Number(targetValue),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(deadline ? { deadline } : {})
    };

    onSubmit(goalData);
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Meta' : 'Nuevo Objetivo de Estudio'}
      subtitle="Establece metas medibles para potenciar tu rendimiento"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tipo de Objetivo
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'daily_time', label: 'Tiempo Diario' },
              { id: 'weekly_tasks', label: 'Tareas Semanales' },
              { id: 'subject_grade', label: 'Nota en Materia' },
              { id: 'custom', label: 'Personalizado' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTypeChange(t.id as GoalType)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  type === t.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Título del Objetivo *
          </label>
          <input
            autoFocus
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Estudiar 2 horas al día..."
            className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
          />
        </div>

        {type === 'subject_grade' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Asignatura
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            >
              <option value="">Selecciona asignatura</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Valor Meta *
            </label>
            <input
              type="number"
              step="any"
              required
              value={targetValue}
              onChange={(e) => setTargetValue(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Valor Actual
            </label>
            <input
              type="number"
              step="any"
              value={currentValue}
              onChange={(e) => setCurrentValue(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Unidad
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="min, tareas, pts"
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Descripción o motivación (opcional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿Por qué es importante para ti este objetivo?"
            className="w-full px-3.5 py-2 rounded-2xl glass-input text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <GlassButton variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton variant="primary" type="submit">
            {initialData ? 'Guardar Cambios' : 'Crear Objetivo'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};

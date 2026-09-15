import React, { useState, useEffect } from 'react';
import { Subject } from '../../types';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { AVAILABLE_COLORS, AVAILABLE_ICONS, getSubjectIcon } from '../../utils/icons';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Subject, 'id'>) => void;
  initialData?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [icon, setIcon] = useState('BookOpen');
  const [teacher, setTeacher] = useState('');
  const [classroom, setClassroom] = useState('');
  const [targetGrade, setTargetGrade] = useState<number>(9.0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setShortName(initialData.shortName || '');
      setColor(initialData.color);
      setIcon(initialData.icon || 'BookOpen');
      setTeacher(initialData.teacher || '');
      setClassroom(initialData.classroom || '');
      setTargetGrade(initialData.targetGrade || 9.0);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setShortName('');
      setColor(AVAILABLE_COLORS[0]);
      setIcon('BookOpen');
      setTeacher('');
      setClassroom('');
      setTargetGrade(9.0);
      setNotes('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subjectData: Omit<Subject, 'id'> = {
      name: name.trim(),
      color,
      icon,
      targetGrade: Number(targetGrade),
      ...(shortName.trim() ? { shortName: shortName.trim() } : {}),
      ...(teacher.trim() ? { teacher: teacher.trim() } : {}),
      ...(classroom.trim() ? { classroom: classroom.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {})
    };

    onSubmit(subjectData);
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Asignatura' : 'Nueva Asignatura'}
      subtitle="Personaliza el color, aula, profesor y metas de la materia"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Short Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la Asignatura *
            </label>
            <input
              autoFocus
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Matemáticas II"
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Corto
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Ej. Mates"
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Teacher and Classroom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Profesor / Docente
            </label>
            <input
              type="text"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="Ej. Dña. Elena Vega"
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Aula / Laboratorio
            </label>
            <input
              type="text"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              placeholder="Ej. Aula 204 / Lab 2"
              className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Color Temático
          </label>
          <div className="flex flex-wrap gap-2.5">
            {AVAILABLE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c
                    ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110'
                    : 'opacity-80 hover:opacity-100 hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Icono
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-32 overflow-y-auto p-1">
            {AVAILABLE_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  icon === ic
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/70'
                }`}
              >
                {getSubjectIcon(ic, "w-4 h-4")}
              </button>
            ))}
          </div>
        </div>

        {/* Target Grade */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nota Objetivo: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{targetGrade}</span>
          </label>
          <input
            type="range"
            min="5"
            max="10"
            step="0.1"
            value={targetGrade}
            onChange={(e) => setTargetGrade(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Apuntes / Criterios de Evaluación
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Criterios de calificación, libros de lectura, temario..."
            className="w-full px-3.5 py-2 rounded-2xl glass-input text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <GlassButton variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton variant="primary" type="submit">
            {initialData ? 'Guardar Cambios' : 'Crear Asignatura'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};

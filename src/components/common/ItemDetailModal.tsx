import React, { useState } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { GlassBadge } from '../ui/GlassBadge';
import { useApp } from '../../context/AppContext';
import { formatMinutes } from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckSquare,
  Square,
  FileText,
  Mic,
  Bell,
  Trash2,
  Edit2,
  BookOpen,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Award
} from 'lucide-react';
import { Task, Exam, CustomEvent, FocusSession } from '../../types';

export type DetailItemType = 'task' | 'exam' | 'customEvent' | 'session';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Task | Exam | CustomEvent | FocusSession | null;
  itemType: DetailItemType | null;
  onEdit: (item: any, type: DetailItemType) => void;
  onDelete?: (id: string, type: DetailItemType) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  itemType,
  onEdit,
  onDelete
}) => {
  const { subjects, deleteTask, deleteExam, deleteCustomEvent, deleteFocusSession, toggleTaskComplete } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen || !item || !itemType) return null;

  // Resolve subject
  const subjectId = (item as any).subjectId;
  const subject = subjects.find((s) => s.id === subjectId);

  // Resolve title, date, time, description/notes
  let title = '';
  let dateStr = '';
  let timeStr: string | undefined = undefined;
  let descriptionText = '';
  let typeLabel = '';
  let typeColor = 'bg-indigo-600';
  let TypeIcon = CheckSquare;

  if (itemType === 'task') {
    const task = item as Task;
    title = task.title;
    dateStr = task.dueDate;
    timeStr = task.dueTime;
    descriptionText = task.description || '';
    typeLabel = 'Tarea';
    typeColor = 'bg-indigo-600';
    TypeIcon = CheckSquare;
  } else if (itemType === 'exam') {
    const exam = item as Exam;
    title = exam.title;
    dateStr = exam.date;
    timeStr = exam.time;
    descriptionText = exam.notes || exam.topics || '';
    typeLabel = 'Examen';
    typeColor = 'bg-rose-500';
    TypeIcon = FileText;
  } else if (itemType === 'customEvent') {
    const ev = item as CustomEvent;
    title = ev.title;
    dateStr = ev.date;
    timeStr = ev.time;
    descriptionText = ev.description || '';
    if (ev.type === 'evento') {
      typeLabel = 'Evento';
      typeColor = 'bg-purple-600';
      TypeIcon = CalendarIcon;
    } else if (ev.type === 'exposicion') {
      typeLabel = 'Exposición Oral';
      typeColor = 'bg-amber-500';
      TypeIcon = Mic;
    } else {
      typeLabel = 'Recordatorio';
      typeColor = 'bg-cyan-500';
      TypeIcon = Bell;
    }
  } else if (itemType === 'session') {
    const session = item as FocusSession;
    title = session.notes || (subject ? `Estudio de ${subject.name}` : 'Sesión de Estudio');
    dateStr = session.date.split('T')[0];
    descriptionText = session.notes || '';
    typeLabel = session.type === 'pomodoro' ? 'Pomodoro' : 'Estudio';
    typeColor = 'bg-emerald-600';
    TypeIcon = Clock;
  }

  // Format Date in Spanish
  let formattedDate = dateStr;
  if (dateStr && dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dObj = new Date(y, m - 1, d);
    if (!isNaN(dObj.getTime())) {
      formattedDate = dObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id, itemType);
    } else {
      if (itemType === 'task') deleteTask(item.id);
      else if (itemType === 'exam') deleteExam(item.id);
      else if (itemType === 'customEvent') deleteCustomEvent(item.id);
      else if (itemType === 'session') deleteFocusSession(item.id);
    }
    onClose();
  };

  const isLongDescription = descriptionText.length > 140;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Header Badges & Type */}
        <div className="flex items-center justify-between gap-2 flex-wrap -mt-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm ${typeColor}`}
            >
              <TypeIcon className="w-3.5 h-3.5" />
              {typeLabel}
            </span>

            {subject && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: subject.color }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                {subject.name}
              </span>
            )}
          </div>

          {/* Time badge if present (NEVER shown if not present) */}
          {timeStr && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {timeStr}
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate}
            {timeStr ? ` · ${timeStr}` : ''}
          </p>
        </div>

        {/* Specific Metadata Grid if applicable */}
        {itemType === 'task' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 capitalize">
              Prioridad: {(item as Task).priority}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 capitalize">
              Estado: {(item as Task).status.replace('_', ' ')}
            </span>
            {(item as Task).estimatedMinutes && (
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold">
                Est. {(item as Task).estimatedMinutes} min
              </span>
            )}
          </div>
        )}

        {itemType === 'exam' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(item as Exam).classroom && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" /> Aula: {(item as Exam).classroom}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold">
              Ponderación: {(item as Exam).weightPercentage || 30}%
            </span>
            {(item as Exam).grade !== undefined && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Award className="w-3 h-3" /> Nota: {(item as Exam).grade}/{(item as Exam).maxGrade || 10}
              </span>
            )}
          </div>
        )}

        {itemType === 'session' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold">
              Duración: {(item as FocusSession).durationMinutes} minutos ({formatMinutes((item as FocusSession).durationMinutes)})
            </span>
          </div>
        )}

        {/* 3. CAJA DE DESCRIPCIÓN DIFERENCIADA */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/10 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Descripción
            </h4>
            {isLongDescription && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    Ver menos <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Ver más <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>

          {descriptionText.trim() ? (
            <p
              className={`text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line transition-all ${
                !isExpanded && isLongDescription ? 'line-clamp-3' : ''
              }`}
            >
              {descriptionText}
            </p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-400 italic">
              Sin descripción
            </p>
          )}
        </div>

        {/* Action Buttons: Toggle Task (if task), Edit and Delete */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-white/10 gap-2">
          <div>
            {itemType === 'task' && (
              <button
                type="button"
                onClick={() => toggleTaskComplete(item.id)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
              >
                {(item as Task).status === 'completada' ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-emerald-500" /> Completada
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-slate-400" /> Marcar completada
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              icon={<Trash2 className="w-4 h-4 text-rose-500" />}
              className="text-rose-600 hover:bg-rose-500/10"
            >
              Eliminar
            </GlassButton>

            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(item, itemType);
              }}
              icon={<Edit2 className="w-4 h-4" />}
            >
              Editar
            </GlassButton>
          </div>
        </div>
      </div>
    </GlassModal>
  );
};

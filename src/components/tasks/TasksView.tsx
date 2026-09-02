import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { TaskModal } from './TaskModal';
import { getRelativeDayString, getTodayDateString } from '../../utils/dateUtils';
import {
  Plus,
  Edit2,
  Trash2,
  CheckSquare,
  Search,
  Filter,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const {
    tasks,
    subjects,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filters State
  const [filterPeriod, setFilterPeriod] = useState<'todas' | 'hoy' | 'semana' | 'completadas'>('todas');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Add inline input
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSubject, setQuickSubject] = useState(subjects[0]?.id || '');

  const todayStr = getTodayDateString();

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    addTask({
      title: quickTitle.trim(),
      subjectId: quickSubject || undefined,
      dueDate: todayStr,
      priority: 'media',
      status: 'pendiente'
    });
    setQuickTitle('');
  };

  const handleOpenAdd = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Deseas eliminar esta tarea?')) {
      deleteTask(id);
    }
  };

  const handleSaveTask = (data: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    // Period filter
    if (filterPeriod === 'hoy') {
      if (t.dueDate !== todayStr) return false;
    } else if (filterPeriod === 'semana') {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      if (t.dueDate < todayStr || t.dueDate > nextWeekStr) return false;
    } else if (filterPeriod === 'completadas') {
      if (t.status !== 'completada') return false;
    }

    // Hide completed in normal filters unless selected
    if (filterPeriod !== 'completadas' && t.status === 'completada') {
      return false;
    }

    // Subject filter
    if (filterSubject !== 'all' && t.subjectId !== filterSubject) {
      return false;
    }

    // Priority filter
    if (filterPriority !== 'all' && t.priority !== filterPriority) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tareas & Entregas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestiona tus deberes, lecturas y trabajos de clase
          </p>
        </div>

        <GlassButton
          variant="primary"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          Nueva Tarea
        </GlassButton>
      </div>

      {/* Quick Add Bar */}
      <GlassCard padding="sm" className="shadow-lg">
        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <CheckSquare className="absolute left-3.5 top-3 w-4 h-4 text-indigo-500" />
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Añadir tarea rápida y pulsar Enter... (ej. Resumen de Historia pág 40)"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={quickSubject}
              onChange={(e) => setQuickSubject(e.target.value)}
              className="px-3 py-2.5 rounded-2xl glass-input text-xs sm:text-sm"
            >
              <option value="">General</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <GlassButton variant="primary" size="sm" type="submit" className="shrink-0">
              Añadir
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Main Period Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['todas', 'hoy', 'semana', 'completadas'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold capitalize transition-all ${
                filterPeriod === period
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              {period === 'todas'
                ? 'Pendientes'
                : period === 'hoy'
                ? 'Para Hoy'
                : period === 'semana'
                ? 'Esta Semana'
                : 'Completadas'}
            </button>
          ))}
        </div>

        {/* Dropdown Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en tareas..."
              className="w-full pl-10 pr-3 py-2 rounded-2xl glass-input text-xs sm:text-sm"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-2xl glass-input text-xs sm:text-sm"
          >
            <option value="all">Todas las Asignaturas</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-3 py-2 rounded-2xl glass-input text-xs sm:text-sm"
          >
            <option value="all">Todas las Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <GlassCard padding="lg" className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 mx-auto flex items-center justify-center mb-3 text-slate-400">
              <CheckSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No hay tareas con los filtros seleccionados
            </p>
            <p className="text-xs text-slate-400 mt-1">
              ¡Disfruta de tu tiempo o aprovecha para adelantar materia!
            </p>
          </GlassCard>
        ) : (
          filteredTasks.map((t) => {
            const sub = subjects.find((s) => s.id === t.subjectId);
            const isDone = t.status === 'completada';

            return (
              <GlassCard
                key={t.id}
                padding="md"
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group transition-all ${
                  isDone ? 'opacity-65' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleTaskComplete(t.id)}
                    className="w-5 h-5 mt-0.5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <h3
                      className={`text-sm sm:text-base font-semibold ${
                        isDone
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {t.title}
                    </h3>
                    {t.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                        {t.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5 mt-2">
                      {sub && (
                        <div className="flex items-center gap-1.5">
                          <span
                            style={{ backgroundColor: sub.color }}
                            className="w-2 h-2 rounded-full"
                          />
                          <span
                            style={{ color: sub.color }}
                            className="text-xs font-semibold"
                          >
                            {sub.name}
                          </span>
                        </div>
                      )}

                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {getRelativeDayString(t.dueDate)} ({t.dueDate})
                      </span>

                      {t.dueTime && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {t.dueTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <GlassBadge
                    size="sm"
                    color={
                      t.priority === 'urgente'
                        ? '#EF4444'
                        : t.priority === 'alta'
                        ? '#F59E0B'
                        : t.priority === 'media'
                        ? '#6366F1'
                        : '#64748B'
                    }
                  >
                    {t.priority}
                  </GlassBadge>

                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Editar tarea"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-colors"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        initialData={editingTask}
      />
    </div>
  );
};

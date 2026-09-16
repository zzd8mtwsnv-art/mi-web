import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { TaskModal } from './TaskModal';
import { ItemDetailModal } from '../common/ItemDetailModal';
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
  const [selectedDetailTask, setSelectedDetailTask] = useState<Task | null>(null);

  // Filters State
  const [filterPeriod, setFilterPeriod] = useState<'todas' | 'hoy' | 'semana' | 'completadas'>('todas');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = getTodayDateString();

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    addTask({
      title: quickTitle.trim(),
      dueDate: todayStr,
      priority: 'media',
      status: 'pendiente',
      ...(quickSubject ? { subjectId: quickSubject } : {})
    });
    setQuickTitle('');
  };

  const [quickTitle, setQuickTitle] = useState('');
  const [quickSubject, setQuickSubject] = useState(subjects[0]?.id || '');

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
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Tareas & Deberes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gestiona tus entregas, ejercicios y proyectos de Bachillerato
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
      <GlassCard padding="sm" className="shadow-md">
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Añadir tarea rápida para hoy... (pulsa Enter)"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
          />

          <select
            value={quickSubject}
            onChange={(e) => setQuickSubject(e.target.value)}
            className="hidden sm:block text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 font-medium outline-none"
          >
            <option value="">General</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <GlassButton
            type="submit"
            variant="primary"
            size="sm"
            disabled={!quickTitle.trim()}
          >
            Añadir
          </GlassButton>
        </form>
      </GlassCard>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Period Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10 overflow-x-auto">
          {[
            { id: 'todas', label: 'Pendientes' },
            { id: 'hoy', label: 'Para Hoy' },
            { id: 'semana', label: 'Próximos 7 días' },
            { id: 'completadas', label: 'Completadas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterPeriod(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterPeriod === tab.id
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Subject dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
            />
          </div>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="text-xs rounded-xl glass-input px-3 py-1.5"
          >
            <option value="all">Todas las materias</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Cards List */}
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
                onClick={() => setSelectedDetailTask(t)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group transition-all cursor-pointer hover:border-indigo-400/60 ${
                  isDone ? 'opacity-65' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(t);
                      }}
                      className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Editar tarea"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(t.id);
                      }}
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

      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={Boolean(selectedDetailTask)}
        onClose={() => setSelectedDetailTask(null)}
        item={selectedDetailTask}
        itemType="task"
        onEdit={(task) => {
          setSelectedDetailTask(null);
          handleOpenEdit(task);
        }}
        onDelete={(id) => {
          handleDelete(id);
          setSelectedDetailTask(null);
        }}
      />

      {/* Edit / Create Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        initialData={editingTask}
      />
    </div>
  );
};
